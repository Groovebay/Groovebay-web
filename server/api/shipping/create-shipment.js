const { ShippingServices, TransactionServices } = require('../../services');
const { getAddress } = require('../../api-util/common');
const { serialize } = require('../../api-util/sdk');
const { getFormattedShippingLabelUrl } = require('../../api-util/common');
/**
 * Create a shipment
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const createShipment = async (req, res) => {
  const { transactionId, sync = true } = req.body;
  const transaction = await TransactionServices.get(transactionId, {
    expand: true,
    include: ['customer', 'provider'],
  });
  const customer = transaction.customer;
  const provider = transaction.provider;
  const customerAddress = getAddress(customer);
  const providerAddress = getAddress(provider);
  const shippingRate = transaction.attributes.protectedData.shippingRate;
  const shipmentData = {
    data: {
      shipments: [
        {
          reference_identifier: `SHARETRIBE-TRANSACTION-${transactionId}`,
          sender: {
            cc: providerAddress.cc,
            ...(providerAddress.region ? { region: providerAddress.region } : {}),
            city: providerAddress.city,
            street: providerAddress.street,
            number: providerAddress.number,
            postal_code: providerAddress.postal_code,
            person: provider.attributes.profile.displayName,
            email: provider.attributes.email,
          },
          recipient: {
            cc: customerAddress.cc,
            ...(customerAddress.region ? { region: customerAddress.region } : {}),
            city: customerAddress.city,
            street: customerAddress.street,
            number: customerAddress.number,
            postal_code: customerAddress.postal_code,
            person: customer.attributes.profile.displayName,
            email: customer.attributes.email,
          },
          options: {
            package_type: 1,
            delivery_type: 2,
          },
          carrier: shippingRate.carrier.id,
        },
      ],
    },
  };
  const response = await ShippingServices.shipments.create(shipmentData);
  if (sync) {
    const shipmentId = response?.data?.ids?.[0]?.id;
    const pdfUrl = response?.data?.pdf?.url ?? '';
    const trackData = await ShippingServices.shipments.track(shipmentId);
    const linkTraceTraceUrl = trackData?.data?.tracktraces?.[0]?.link_tracktrace;
    const shipmentLabelUrl = getFormattedShippingLabelUrl(pdfUrl);
    await TransactionServices.updateMetadata(transactionId, {
      shipmentId,
      ...(shipmentLabelUrl ? { shipmentLabelUrl } : {}),
      ...(linkTraceTraceUrl ? { linkTraceTraceUrl } : {}),
    });
  }
  res.status(200).send(
    serialize({
      status: 200,
      statusText: 'OK',
      data: {
        message: 'Shipment created successfully',
      },
    })
  );
};

module.exports = createShipment;
