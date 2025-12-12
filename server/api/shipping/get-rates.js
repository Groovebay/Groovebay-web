const { handleError, serialize, getIntegrationSdk } = require('../../api-util/sdk');
const { UserServices, ShippingServices } = require('../../services');
const { validateRequiredFields, getAddress } = require('../../api-util/common');
const isEmpty = require('lodash/isEmpty');

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
    if (isEmpty(customerAddress)) {
      const error = new Error('Customer does not have a shipping address');
      error.status = 400;
      error.statusText = 'Bad Request';
      throw error;
    }

    if (isEmpty(providerAddress)) {
      const error = new Error('Provider does not have a shipping address');
      error.status = 400;
      error.statusText = 'Bad Request';
      throw error;
    }
    // Validate addresses using MyParcel Address API
    try {
      const [customerValidation, providerValidation] = await Promise.all([
        ShippingServices.addresses.validate({
          countryCode: customerAddress.cc || 'NL',
          postalCode: customerAddress.postal_code,
          city: customerAddress.city,
          houseNumber: customerAddress.number,
          street: customerAddress.street,
          region: customerAddress.region,
        }),
        ShippingServices.addresses.validate({
          countryCode: providerAddress.cc || 'NL',
          postalCode: providerAddress.postal_code,
          city: providerAddress.city,
          houseNumber: providerAddress.number,
          street: providerAddress.street,
          region: providerAddress.region,
        }),
      ]);

      if (!customerValidation.valid) {
        const error = new Error('Customer shipping address not found');
        error.status = 400;
        error.statusText = 'customer_shipping_address_not_found';
        error.data = {
          message: 'Customer shipping address not found',
        };
        throw error;
      }

      if (!providerValidation.valid) {
        const error = new Error('Provider shipping address not found');
        error.status = 400;
        error.statusText = 'provider_shipping_address_not_found';
        error.data = {
          message: 'Provider shipping address not found',
        };
        throw error;
      }
    } catch (validationError) {
      // If validation fails due to API error, log but continue
      // If validation fails due to invalid address, throw error
      if (validationError.status === 400) {
        throw validationError;
      }
      console.error('Address validation error:', validationError.message);
      // Continue with rate calculation even if validation API fails
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
