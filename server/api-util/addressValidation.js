const axios = require('axios');

const ADDRESS_API_BASE_URL = 'https://address.api.myparcel.nl';

/**
 * Validate an address using MyParcel Address API
 * @param {Object} address - Address object to validate
 * @param {string} address.countryCode - ISO 3166-1 alpha-2 country code
 * @param {string} [address.postalCode] - Postal code
 * @param {string} [address.city] - City name
 * @param {string} [address.houseNumber] - House number (required for NL)
 * @param {string} [address.houseNumberSuffix] - House number suffix
 * @param {string} [address.boxNumber] - Box number (for Belgian addresses)
 * @param {string} [address.region] - Region/State
 * @param {string} [address.street] - Street name
 * @param {string} [validationType] - 'FORMAT' to only validate format, otherwise validates existence
 * @returns {Promise<Object>} Validation result with { valid: boolean }
 */
const validateAddress = async (address, validationType = null) => {
  const apiKey = process.env.MY_PARCEL_API_KEY_BASE_64;
  if (!apiKey) {
    throw new Error('MyParcel API key not configured');
  }

  if (!address || !address.countryCode) {
    throw new Error('Address with countryCode is required');
  }

  const params = {
    countryCode: address.countryCode || address.cc,
    ...(address.postalCode || address.postal_code
      ? { postalCode: address.postalCode || address.postal_code }
      : {}),
    ...(address.city ? { city: address.city } : {}),
    ...(address.houseNumber || address.number
      ? { houseNumber: address.houseNumber || address.number }
      : {}),
    ...(address.houseNumberSuffix ? { houseNumberSuffix: address.houseNumberSuffix } : {}),
    ...(address.boxNumber ? { boxNumber: address.boxNumber } : {}),
    ...(address.region ? { region: address.region } : {}),
    ...(address.street ? { street: address.street } : {}),
    ...(validationType ? { validationType } : {}),
  };

  try {
    const response = await axios.get(`${ADDRESS_API_BASE_URL}/validate`, {
      params,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `bearer ${apiKey}`,
      },
    });

    return response.data;
  } catch (error) {
    console.error('Error validating address:', error.response?.data || error.message);
    throw new Error(
      error.response?.data?.message || error.message || 'Failed to validate address'
    );
  }
};

module.exports = { validateAddress };

