const { handleError, serialize } = require('../../api-util/sdk');
const { ShippingServices, TransactionServices } = require('../../services');
const { validateRequiredFields } = require('../../api-util/common');

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

    // Fetch shipping label
    const labelData = await ShippingServices.shipments.label(shipmentId);
    const labelUrl = labelData?.data?.pdfs?.url;
    if (shouldResyncShippingDetails && labelUrl) {
      // Update transaction metadata with shipping details
      await TransactionServices.updateMetadata(transaction.id.uuid, {
        shipmentLabelUrl: labelUrl,
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
            labelUrl,
          },
        })
      );
  } catch (error) {
    handleError(res, error);
  }
};

module.exports = getShipmentLabel;
