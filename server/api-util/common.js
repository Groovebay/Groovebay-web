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

export { validateRequiredFields, getAddress };
