const { getAddress } = require('../../api-util/common');
const { denormalisedResponseEntities } = require('../../api-util/format');
const { getIntegrationSdk } = require('../../api-util/sdk');
const { ShippingServices, TransactionServices } = require('../../services');

const paymentMethodsAvailable = ['ideal'];
const createShipment = async transaction => {
  try {
    const customer = transaction.customer;
    const provider = transaction.provider;
    const customerAddress = getAddress(customer);
    const providerAddress = getAddress(provider);
    const shippingRate = transaction.attributes.protectedData.shippingRate;
    const shipmentData = {
      data: {
        shipments: [
          {
            reference_identifier: `SHARETRIBE-TRANSACTION-${transaction.id.uuid}`,
            sender: {
              cc: providerAddress.cc,
              region: providerAddress.region,
              city: providerAddress.city,
              street: providerAddress.street,
              number: providerAddress.number,
              postal_code: providerAddress.postal_code,
              person: provider.attributes.profile.displayName,
              email: provider.attributes.email,
            },
            recipient: {
              cc: customerAddress.cc,
              region: customerAddress.region,
              city: customerAddress.city,
              street: customerAddress.street,
              number: customerAddress.number,
              postal_code: customerAddress.postal_code,
              person: customer.attributes.profile.displayName,
              email: customer.attributes.email,
            },
            options: {
              package_type: 1,
              delivery_type: 2,
            },
            carrier: shippingRate.carrier.id,
          },
        ],
      },
    };
    const response = await ShippingServices.shipments.create(shipmentData);
    const shipmentId = response?.data?.ids?.[0]?.id;
    if (shipmentId) {
      await TransactionServices.updateMetadata(transaction.id, {
        shipmentId,
      });
    }
  } catch (error) {
    console.log(
      'Failed to create shipment in confirm payment transition of iDeal',
      error.data.errors
    );
    return null;
  }
};

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
      include: ['provider', 'listing', 'customer'],
    });

    const [transaction] = denormalisedResponseEntities(txRes);
    const transactionId = transaction.id;
    await iSdk.transactions.transition({
      id: transactionId,
      transition: 'transition/confirm-push-payment',
      params: {},
    });

    const currentCart = transaction?.customer?.attributes?.profile?.privateData?.cart;
    const fromCart = transaction?.attributes?.protectedData?.fromCart;
    const providerId = transaction?.provider?.id?.uuid;
    const customerId = transaction?.customer?.id?.uuid;
    if (fromCart) {
      if (currentCart && currentCart[providerId]) {
        delete currentCart[providerId];
      }
      await iSdk.users.updateProfile({
        id: customerId,
        privateData: {
          cart: currentCart,
        },
      });
    }

    await createShipment(transaction);

    //create shipment for case iDeal
  } catch (error) {
    console.log('Failed to update confirm payment transition', error.data.errors);
  }
};

module.exports = {
  confirmPaymentTransition,
};
