import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { updateCartHelper } from '../util/cart';
import { storableError } from '../util/errors';
import { updateCurrentUserProfileThunk } from './user.duck';

// ================ Initial State ================ //

const initialState = {
  cart: {},
  updateCartInProgress: [],
  updateCartError: null,

  clearAuthorCartInProgress: [],
  clearAuthorCartError: null,
};

const removeListingsFromCart = (cart, listingIds) => {
  return Object.keys(cart).reduce((acc, providerId) => {
    const providerCart = cart[providerId];
    const newProviderCart = Object.keys(providerCart).reduce((innerAcc, listingId) => {
      if (!listingIds.includes(listingId)) {
        innerAcc[listingId] = providerCart[listingId];
      }
      return innerAcc;
    }, {});

    if (Object.keys(newProviderCart).length > 0) {
      acc[providerId] = newProviderCart;
    }

    return acc;
  }, {});
};

// ================ Redux Toolkit Slice ================ //

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    clearCart: (state, action) => {
      const listingIds = action.payload;
      if (!listingIds || listingIds.length === 0) {
        state.cart = {};
        return;
      }
      state.cart = removeListingsFromCart(state.cart, listingIds);
    },
    setCart: (state, action) => {
      state.cart = action.payload || {};
    },
  },
  extraReducers: builder => {
    builder
      .addCase(updateCartThunk.pending, (state, action) => {
        state.updateCartInProgress.push(action.meta.arg.listingId);
        state.updateCartError = null;
      })
      .addCase(updateCartThunk.fulfilled, (state, action) => {
        state.updateCartInProgress = state.updateCartInProgress.filter(
          listingId => listingId !== action.meta.arg.listingId
        );
      })
      .addCase(updateCartThunk.rejected, (state, action) => {
        state.updateCartInProgress = state.updateCartInProgress.filter(
          listingId => listingId !== action.meta.arg.listingId
        );
        state.updateCartError = action.payload;
      })
      .addCase(clearAuthorCartThunk.pending, (state, action) => {
        state.clearAuthorCartInProgress.push(action.meta.arg);
        state.clearAuthorCartError = null;
      })
      .addCase(clearAuthorCartThunk.fulfilled, (state, action) => {
        state.clearAuthorCartInProgress = state.clearAuthorCartInProgress.filter(
          providerId => providerId !== action.meta.arg
        );
      })
      .addCase(clearAuthorCartThunk.rejected, (state, action) => {
        state.clearAuthorCartInProgress = state.clearAuthorCartInProgress.filter(
          providerId => providerId !== action.meta.arg
        );
        state.clearAuthorCartError = action.payload;
      });
  },
});

export default cartSlice.reducer;

// ================ Action creators ================ //

export const {
  clearCart,
  setCart,
  updateCartRequest,
  updateCartSuccess,
  updateCartError,
} = cartSlice.actions;

// ================ Async Thunks ================ //

export const updateCartThunk = createAsyncThunk(
  'cart/updateCart',
  async ({ providerId, listingId, quantity }, thunkAPI) => {
    const { dispatch, getState } = thunkAPI;
    const oldCart = getState().cart?.cart || {};
    const currentUser = getState().user?.currentUser;
    const isAuthenticated = !!currentUser?.id;

    let newCart = oldCart;

    if (isAuthenticated) {
      // For authenticated users, update cart in user profile
      newCart = updateCartHelper({ oldCart, providerId, listingId, quantity });

      // Update user profile with new cart
      await dispatch(
        updateCurrentUserProfileThunk({
          data: {
            privateData: { cart: newCart },
          },
          options: {
            expand: true,
          },
        })
      ).unwrap();
    } else {
      // For unauthenticated users, save to localStorage
      newCart = updateCartHelper({ oldCart, providerId, listingId, quantity });
      localStorage.setItem('cart', JSON.stringify(newCart));
    }
    dispatch(setCart({ ...newCart }));
    return { providerId, listingId, cart: newCart };
  },
  {
    serializeError: storableError,
  }
);

// Backward compatible wrapper
export const updateCart = ({ providerId, listingId, quantity }) => dispatch => {
  return dispatch(updateCartThunk({ providerId, listingId, quantity })).unwrap();
};

/**
 * Load cart from localStorage
 */
export const loadCartFromLocalStorage = () => dispatch => {
  if (typeof window !== 'undefined') {
    const cart = localStorage.getItem('cart');
    if (cart) {
      try {
        const parsedCart = JSON.parse(cart);
        dispatch(setCart(parsedCart));
        return parsedCart;
      } catch (error) {
        console.error('Error parsing cart from localStorage:', error);
        return {};
      }
    }
  }
  return {};
};

/**
 * Save cart to localStorage
 */
export const saveCartToLocalStorage = cart => dispatch => {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem('cart', JSON.stringify(cart));
      dispatch(setCart(cart));
    } catch (error) {
      console.error('Error saving cart to localStorage:', error);
    }
  }
};

export const clearAuthorCartThunk = createAsyncThunk(
  'cart/clearAuthorCartThunk',
  async (providerId, thunkAPI) => {
    const { dispatch, getState } = thunkAPI;
    const currentCart = { ...getState().cart?.cart } || {};
    console.log({ clearAuthorCartThunk: currentCart, providerId });
    if (currentCart[providerId]) {
      delete currentCart[providerId];
    }
    await dispatch(
      updateCurrentUserProfileThunk({
        data: {
          privateData: { cart: currentCart },
        },
        options: {
          expand: true,
        },
      })
    );
    dispatch(setCart({ ...currentCart }));
    return { cart: currentCart };
  },
  {
    serializeError: storableError,
  }
);
