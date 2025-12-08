const { TransactionServices, ShippingServices } = require('../../services');

const parseTransactionIdFromReference = reference => {
  const prefix = 'SHARETRIBE-TRANSACTION-';
  if (typeof reference === 'string' && reference.startsWith(prefix)) {
    return reference.slice(prefix.length);
  }
  return null;
};

const updateShipmentLabelUrl = async data => {
  try {
    const shipmentId = data?.shipment_id || data?.shipment?.id || data?.id;

    const reference = data?.reference_identifier || data?.shipment?.reference_identifier;
    const transactionId = parseTransactionIdFromReference(reference);

    let labelData;
    try {
      labelData = await ShippingServices.shipments.label(shipmentId);
    } catch (err) {
      console.error('Failed to fetch shipment label', err.message);
      return res.status(502).send();
    }

    if (transactionId && labelData) {
      try {
        const labelUrl = labelData.data?.pdfs?.url;
        await TransactionServices.updateMetadata(transactionId, {
          shipmentLabelUrl: labelUrl,
        });
      } catch (err) {
        console.error('Failed to update transaction metadata', err.message);
      }
    } else {
      console.log('MyParcel webhook missing reference identifier for transaction', reference);
    }
  } catch (err) {
    console.error('Failed to update transaction metadata', err.message);
  }
};

const myparcelWebhooks = async (req, res) => {
  try {
    const { event, data } = req.body || {};

    if (!event) {
      console.log('MyParcel webhook missing event', req.body);
      return res.status(400).send();
    }

    switch (event) {
      case 'shipment_label_created':
        await updateShipmentLabelUrl(data);
        break;
      default:
        console.log(`Unhandled MyParcel event ${event}`);
    }

    return res.status(200).send();
  } catch (err) {
    console.error('Unhandled MyParcel webhook error', err);
    return res.status(500).send();
  }
};

module.exports = myparcelWebhooks;
