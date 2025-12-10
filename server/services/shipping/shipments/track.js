const shippingApi = require('../../../api-util/shippingSdk');

const track = async shipmentId => {
  const response = await shippingApi.get(`/tracktraces/${shipmentId}?extra_info=delivery_moment`, {
    headers: {
      'Accept-Language': 'en_GB',
    },
  });
  return response.data;
};

module.exports = track;
