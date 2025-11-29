const { denormalisedResponseEntities } = require('../../api-util/format');
const { getIntegrationSdk } = require('../../api-util/sdk');

const paymentMethodsAvailable = ['ideal'];

const confirmPaymentTransition = async data => {
  try {
    const iSdk = getIntegrationSdk();
    const { metadata, payment_method_types } = data;

    if (!paymentMethodsAvailable.includes(payment_method_types[0])) {
      console.log('Payment method not supported', payment_method_types[0]);
      return;
    }

    const txRes = await iSdk.transactions.show({
      id: metadata['sharetribe-transaction-id'],
      include: ['provider', 'listing'],
    });

    const [transaction] = denormalisedResponseEntities(txRes);
    const transactionId = transaction.id;
    await iSdk.transactions.transition({
      id: transactionId,
      transition: 'transition/confirm-push-payment',
      params: {},
    });

    const currentCart = transaction?.provider?.attributes?.profile?.privateData?.cart;
    const providerId = transaction?.provider?.id?.uuid;
    if (currentCart && currentCart[providerId]) {
      delete currentCart[providerId];
    }
    await iSdk.users.updateProfile({
      id: providerId,
      privateData: {
        cart: currentCart,
      },
    });
  } catch (error) {
    console.log('Failed to update confirm payment transition', error.data.errors);
  }
};

module.exports = {
  confirmPaymentTransition,
};
