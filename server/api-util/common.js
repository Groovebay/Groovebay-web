/**
 * Validate required fields in request body
 * @param {Object} body - Request body
 * @param {Array} requiredFields - Array of required field names
 * @throws {Error} If required fields are missing
 */
const validateRequiredFields = (body, requiredFields) => {
  const missingFields = requiredFields.filter(field => !body[field]);

  if (missingFields.length > 0) {
    const error = new Error(
      `Missing required parameters: ${missingFields.join(', ')} are required`
    );
    error.status = 400;
    error.statusText = 'Bad Request';
    throw error;
  }
};

/**
 * Get address from user
 * @param {Object} user - User object
 * @returns {Object} Address object
 */
const getAddress = user => {
  return user.attributes.profile.protectedData.shippingAddress;
};

const SHIPPING_API_BASE_URL = 'https://api.myparcel.nl';

const getFormattedShippingLabelUrl = url => {
  if (!url) return null;
  return url.startsWith('https://') ? url : `${SHIPPING_API_BASE_URL}${url}`;
};

module.exports = {
  validateRequiredFields,
  getAddress,
  SHIPPING_API_BASE_URL,
  getFormattedShippingLabelUrl,
};
