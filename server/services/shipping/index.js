const shipments = require('./shipments');
const rates = require('./rates');
const webhooks = require('./webhooks');
const addresses = require('./addresses');
const ShippingServices = {
  shipments,
  rates,
  webhooks,
  addresses,
};

module.exports = ShippingServices;
