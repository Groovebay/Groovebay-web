const shippingApi = require('../../../api-util/shippingSdk');

const create = async shipment => {
  const response = await shippingApi.post('/shipments', shipment);
  return response.data;
};

module.exports = create;
