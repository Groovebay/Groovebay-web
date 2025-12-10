const axios = require('axios');
const { SHIPPING_API_BASE_URL } = require('./common');

const shippingApi = axios.create({
  baseURL: SHIPPING_API_BASE_URL,
  headers: {
    'x-dmp-feature-flags': 'x-dmp-set-custom-sender',
    'Content-Type': 'application/vnd.shipment+json;charset=utf-8;version=1.1',
    'User-Agent': 'CustomApiCall/2',
    Authorization: `bearer ${process.env.MY_PARCEL_API_KEY_BASE_64}`,
  },
});

module.exports = shippingApi;
