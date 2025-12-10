const { TransactionServices, ShippingServices } = require('../../services');

const parseTransactionIdFromReference = reference => {
  const prefix = 'SHARETRIBE-TRANSACTION-';
  if (typeof reference === 'string' && reference.startsWith(prefix)) {
    return reference.slice(prefix.length);
  }
  return null;
};

const updateShipmentLabelUrl = async data => {
  console.log('Updating shipment label URL', { data });
  try {
    const { hooks = [] } = data || {};
    const shipmentId = hooks?.[0]?.shipment_ids?.[0];
    const pdfUrl = hooks?.[0]?.pdf;
    const shipmentData = shipmentId ? await ShippingServices.shipments.get(shipmentId) : null;
    const reference = shipmentData?.reference_identifier;

    const transactionId = parseTransactionIdFromReference(reference);
    const transaction = await TransactionServices.get(transactionId);

    if (!transaction) {
      console.log('Transaction not found', transactionId);
      return null;
    }

    const labelUrlFromTransaction = transaction?.attributes?.metadata?.shipmentLabelUrl;
    const linkTraceTraceUrlFromTransaction = transaction?.attributes?.metadata?.linkTraceTraceUrl;
    if (!!labelUrlFromTransaction || !!linkTraceTraceUrlFromTransaction) {
      console.log(
        'Shipment label and link trace trace URL already exist in transaction',
        transactionId
      );
      return null;
    }

    let labelData;
    let trackData;
    try {
      labelData = pdfUrl
        ? { data: { pdfs: { url: pdfUrl } } }
        : await ShippingServices.shipments.label(shipmentId);
      trackData = await ShippingServices.shipments.track(shipmentId);
    } catch (err) {
      console.error('Failed to fetch shipment label', err.message);
      return null;
    }

    if (transactionId && labelData) {
      try {
        const labelUrl = labelData?.data?.pdfs?.url;
        const linkTraceTraceUrl = trackData?.data?.tracktraces?.[0]?.link_tracktrace;
        await TransactionServices.updateMetadata(transactionId, {
          shipmentLabelUrl: labelUrl,
          linkTraceTraceUrl,
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
    console.log('MyParcel webhook received', { requestBody: req.body });
    const { data } = req.body || {};
    if (!data) {
      console.log('MyParcel webhook missing data', req.body);
      return res.status(400).send();
    }

    await updateShipmentLabelUrl(data);

    return res.status(200).send();
  } catch (err) {
    console.error('Unhandled MyParcel webhook error', err);
    return res.status(500).send();
  }
};

module.exports = myparcelWebhooks;
