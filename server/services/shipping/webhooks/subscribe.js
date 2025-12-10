const shippingApi = require('../../../api-util/shippingSdk');

const HOOK_SHIPMENT_LABEL_CREATED = 'shipment_label_created';
// Creates or overwrites a MyParcel webhook subscription for the given hook and callback URL.
const subscribe = async () => {
  const rootUrl = process.env.REACT_APP_MARKETPLACE_ROOT_URL;
  if (!rootUrl) {
    console.error('REACT_APP_MARKETPLACE_ROOT_URL is required to subscribe MyParcel webhooks');
    return null;
  }

  // MyParcel requires lowercase callback URL and HTTPS
  const callbackUrl = `${rootUrl.replace(/\/$/, '')}/api/webhooks/myparcel`.toLowerCase();

  if (!callbackUrl.startsWith('https://')) {
    console.warn('MyParcel requires HTTPS callback URLs; current callback is', callbackUrl);
    return;
  }

  try {
    const response = await shippingApi.post(
      '/webhook_subscriptions',
      {
        data: {
          webhook_subscriptions: [
            {
              hook: HOOK_SHIPMENT_LABEL_CREATED,
              url: callbackUrl,
            },
          ],
        },
      },
      {
        headers: {
          // MyParcel expects standard JSON here, not the shipment content-type default
          'Content-Type': 'application/json; charset=utf-8',
        },
      }
    );
    console.log('MyParcel webhook subscribed', response.data.data.ids);
    return response.data;
  } catch (err) {
    console.error('Failed to subscribe MyParcel webhook', err);
    return null;
  }
};

module.exports = subscribe;
