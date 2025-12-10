const shippingApi = require('../../../api-util/shippingSdk');

const create = async shipment => {
  const response = await shippingApi.post('/shipments', shipment, {
    headers: {
      Accept: 'application/vnd.shipment_label+json;charset=utf-8',
    },
  });
  return response.data;
};

module.exports = create;
