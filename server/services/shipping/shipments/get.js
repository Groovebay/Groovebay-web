const shippingApi = require('../../../api-util/shippingSdk');

const get = async shipmentId => {
  const response = await shippingApi.get(`/shipments/${shipmentId}`);
  return response.data?.data?.shipments?.[0];
};

module.exports = get;
