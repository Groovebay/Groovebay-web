const shipments = require('./shipments');
const rates = require('./rates');
const webhooks = require('./webhooks');
const ShippingServices = {
  shipments,
  rates,
  webhooks,
};

module.exports = ShippingServices;
