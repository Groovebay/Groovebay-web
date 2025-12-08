const shippingApi = require('../../../api-util/shippingSdk');

const getShipmentLabel = async shipmentId => {
  const response = await shippingApi.get(`/shipment_labels/${shipmentId}`, {
    headers: {
      //GET DOWNLOAD URL ONLY
      'Content-Type': 'application/json;charset=utf-8',
    },
  });
  return response.data;
};

module.exports = getShipmentLabel;
