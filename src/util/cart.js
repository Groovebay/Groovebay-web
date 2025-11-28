export const updateCartHelper = ({ oldCart = {}, providerId, listingId, quantity }) => {
  let newCart = {
    ...oldCart,
  };

  if (!newCart[providerId]) {
    newCart = {
      ...newCart,
      [providerId]: {},
    };
  }

  newCart = {
    ...newCart,
    [providerId]: {
      ...newCart[providerId],
      [listingId]: {
        ...newCart[providerId][listingId],
        quantity,
      },
    },
  };

  if (quantity === 0) {
    delete newCart[providerId][listingId];
  }

  return newCart;
};
