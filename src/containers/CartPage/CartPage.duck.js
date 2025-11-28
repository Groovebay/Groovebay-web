import isEmpty from 'lodash/isEmpty';
import { setCart } from '../../ducks/cart.duck';
import { addMarketplaceEntities } from '../../ducks/marketplaceData.duck';
import { fetchCurrentUser } from '../../ducks/user.duck';
import { denormalisedResponseEntities } from '../../util/data';
import { createImageVariantConfig } from '../../util/sdkLoader';

export const SET_INITIAL_VALUES = 'app/CartPage/SET_INITIAL_VALUES';
export const FETCH_CART_LISTINGS_REQUEST = 'app/CartPage/FETCH_CART_LISTINGS_REQUEST';
export const FETCH_CART_LISTINGS_SUCCESS = 'app/CartPage/FETCH_CART_LISTINGS_SUCCESS';
export const FETCH_CART_LISTINGS_ERROR = 'app/CartPage/FETCH_CART_LISTINGS_ERROR';

const initialState = {
  cartListingIds: [],
  fetchCartListingsInProgress: false,
  fetchCartListingsError: null,
};

export const setInitialValues = cart => ({
  type: SET_INITIAL_VALUES,
  payload: { cart },
});

export const fetchCartListingsRequest = () => ({
  type: FETCH_CART_LISTINGS_REQUEST,
});

export const fetchCartListingsSuccess = cartListingIds => ({
  type: FETCH_CART_LISTINGS_SUCCESS,
  payload: cartListingIds,
});

export const fetchCartListingsError = error => ({
  type: FETCH_CART_LISTINGS_ERROR,
  payload: { error },
});

export const fetchCartListings = (cartListingIds, config) => async (dispatch, getState, sdk) => {
  dispatch(fetchCartListingsRequest());
  try {
    const { aspectWidth = 1, aspectHeight = 1 } = config.layout.listingImage;
    const variantPrefix = 'cart-card';
    const listingVariantPrefix = 'listing-card';
    const aspectRatio = aspectHeight / aspectWidth;
    if (!cartListingIds || (cartListingIds && cartListingIds.length === 0)) {
      dispatch(fetchCartListingsSuccess([]));
      return;
    }
    const cartListings = await sdk.listings.query({
      ids: cartListingIds,
      include: ['images', 'author', 'currentStock'],
      'fields.image': [
        `variants.${variantPrefix}`,
        `variants.${listingVariantPrefix}`,
        `variants.${listingVariantPrefix}-2x`,
        `variants.${listingVariantPrefix}-4x`,
        `variants.${listingVariantPrefix}-6x`,
      ],
      ...createImageVariantConfig(`${variantPrefix}`, 100, aspectRatio),
      ...createImageVariantConfig(`${listingVariantPrefix}`, 400, aspectRatio),
      ...createImageVariantConfig(`${listingVariantPrefix}-2x`, 800, aspectRatio),
      ...createImageVariantConfig(`${listingVariantPrefix}-4x`, 1600, aspectRatio),
      ...createImageVariantConfig(`${listingVariantPrefix}-6x`, 2400, aspectRatio),
      'limit.images': 1,
    });
    const entities = denormalisedResponseEntities(cartListings);
    dispatch(addMarketplaceEntities(cartListings));
    dispatch(fetchCartListingsSuccess(entities.map(entity => entity.id)));
  } catch (error) {
    dispatch(fetchCartListingsError(error));
  }
};

export default function cartPageReducer(state = initialState, action = {}) {
  const { type, payload } = action;
  switch (type) {
    case SET_INITIAL_VALUES:
      return { ...state, ...payload };
    case FETCH_CART_LISTINGS_REQUEST:
      return { ...state, fetchCartListingsInProgress: true };
    case FETCH_CART_LISTINGS_SUCCESS:
      return {
        ...state,
        fetchCartListingsInProgress: false,
        cartListingIds: payload,
      };
    case FETCH_CART_LISTINGS_ERROR:
      return {
        ...state,
        fetchCartListingsInProgress: false,
        fetchCartListingsError: payload.error,
      };
    default:
      return state;
  }
}

export const loadData = (_params, _search, config) => async (dispatch, getState, sdk) => {
  await dispatch(fetchCurrentUser({ enforce: true }));
  const cart = getState().cart.cart;
  if (!isEmpty(cart)) {
    dispatch(setCart(cart));
  }
  const cartListingIds = Object.values(cart).reduce((acc, curr) => {
    return acc.concat(Object.keys(curr));
  }, []);
  return dispatch(fetchCartListings(cartListingIds, config));
};
