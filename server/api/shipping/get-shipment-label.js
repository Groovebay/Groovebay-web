const { handleError, serialize } = require('../../api-util/sdk');
const { ShippingServices, TransactionServices } = require('../../services');
const { validateRequiredFields } = require('../../api-util/common');
const { getFormattedShippingLabelUrl } = require('../../api-util/common');
/**
 * Get shipping label by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getShipmentLabel = async (req, res) => {
  try {
    const { transactionId, shouldResyncShippingDetails = true } = req.body || {};

    // Input validation
    validateRequiredFields(req.body, ['transactionId']);

    const transaction = await TransactionServices.get(transactionId);
    const shipmentId = transaction?.attributes?.metadata?.shipmentId;
    const shipmentLabelUrl = transaction?.attributes?.metadata?.shipmentLabelUrl;
    const linkTraceTraceUrl = transaction?.attributes?.metadata?.linkTraceTraceUrl;
    if (!shipmentId) {
      return res.status(200).send(
        serialize({
          status: 200,
          statusText: 'OK',
          data: {
            message: 'No shipment ID found in transaction metadata. Please try again later.',
            labelUrl: null,
            linkTraceTraceUrl: null,
          },
        })
      );
    }

    // Fetch shipping label
    const labelData = shipmentLabelUrl
      ? { data: { pdfs: { url: shipmentLabelUrl } } }
      : await ShippingServices.shipments.label(shipmentId);
    const trackData = linkTraceTraceUrl
      ? { data: { tracktraces: [{ link_tracktrace: linkTraceTraceUrl }] } }
      : await ShippingServices.shipments.track(shipmentId);
    const newLinkTraceTraceUrl = trackData?.data?.tracktraces?.[0]?.link_tracktrace;
    const labelUrl = labelData?.data?.pdfs?.url;
    const formattedLabelUrl = getFormattedShippingLabelUrl(labelUrl);
    if (shouldResyncShippingDetails && labelUrl) {
      // Update transaction metadata with shipping details
      await TransactionServices.updateMetadata(transaction.id.uuid, {
        shipmentLabelUrl: formattedLabelUrl,
        linkTraceTraceUrl: newLinkTraceTraceUrl,
      });
    }

    res
      .status(200)
      .set('Content-Type', 'application/transit+json')
      .send(
        serialize({
          status: 200,
          statusText: 'OK',
          data: {
            labelUrl: formattedLabelUrl,
            linkTraceTraceUrl: newLinkTraceTraceUrl,
          },
        })
      );
  } catch (error) {
    handleError(res, error);
  }
};

module.exports = getShipmentLabel;
