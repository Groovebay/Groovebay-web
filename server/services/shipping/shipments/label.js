const shippingApi = require('../../../api-util/shippingSdk');

const getShipmentLabel = async shipmentId => {
  const response = await shippingApi.get(`/shipment_labels/${shipmentId}?format=A4&position=3`, {
    headers: {
      //GET DOWNLOAD URL ONLY
      Accept: 'application/json;charset=utf-8',
    },
  });
  return response.data;
};

module.exports = getShipmentLabel;
