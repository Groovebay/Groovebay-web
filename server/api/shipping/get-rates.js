const { handleError, serialize, getIntegrationSdk } = require('../../api-util/sdk');
const { UserServices, ShippingServices } = require('../../services');
const { validateRequiredFields, getAddress } = require('../../api-util/common');

/**
 * Get shipping rates for a transaction
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */

const REGULAR_VINYL_RECORD_WEIGHT = 0.5;
const getShippingRates = async (req, res) => {
  try {
    const { customerId, providerId, providerCart } = req.body || {};
    // Input validation
    validateRequiredFields(req.body, ['customerId', 'providerId', 'providerCart']);

    // Fetch user data
    const [customer, provider] = await Promise.all([
      UserServices.get(customerId, { expand: true }),
      UserServices.get(providerId, { expand: true }),
    ]);
    const customerAddress = getAddress(customer);
    const providerAddress = getAddress(provider);
    // Validate users have shipping addresses
    if (!customerAddress) {
      const error = new Error('Customer does not have a shipping address');
      error.status = 400;
      error.statusText = 'Bad Request';
      throw error;
    }

    if (!providerAddress) {
      const error = new Error('Provider does not have a shipping address');
      error.status = 400;
      error.statusText = 'Bad Request';
      throw error;
    }

    const totalWeight = Math.max(
      Object.values(providerCart).reduce(
        (acc, item) => acc + item.quantity * REGULAR_VINYL_RECORD_WEIGHT,
        0
      ),
      1
    );
    const rates = ShippingServices.rates.getAll({ weight: totalWeight });

    // Send response
    const status = 200;
    const statusText = 'OK';
    console.log({ rates });
    res
      .status(status)
      .set('Content-Type', 'application/transit+json')
      .send(
        serialize({
          status,
          statusText,
          data: rates,
        })
      )
      .end();
  } catch (error) {
    handleError(res, error);
  }
};

module.exports = getShippingRates;
