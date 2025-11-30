/**
 * Validate the stock
 * @param {Object} listing - The listing
 * @param {Object} orderData - The order data
 * @returns {Object} The out of stock sizes and the available stocks
 */
const validateStock = (listings, orderData) => {
  const { providerCart } = orderData;
  let outOfStockListings = {};
  if (!providerCart) {
    const message = 'Error: orderData is missing the following information: providerCart';
    const error = new Error(message);
    error.status = 400;
    error.statusText = message;
    error.data = {};
    throw error;
  }
  listings.forEach(listing => {
    const { id: listingId } = listing;
    const quantity = listing.currentStock.attributes.quantity;

    if (!quantity) {
      return;
    }

    const listingOrderQuantity = providerCart[listingId.uuid].quantity;
    if (quantity < listingOrderQuantity) {
      if (!outOfStockListings[listingId.uuid]) {
        outOfStockListings[listingId.uuid] = {};
      }
      outOfStockListings[listingId.uuid] = {
        currentStockQuantity: quantity,
        orderedQuantity: listingOrderQuantity,
      };
    }
  });
  return outOfStockListings;
};

module.exports = { validateStock };
