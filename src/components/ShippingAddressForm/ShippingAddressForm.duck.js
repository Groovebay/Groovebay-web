import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import get from 'lodash/get';
import { denormalisedResponseEntities } from '../../util/data';
import { updateCurrentUserProfileThunk } from '../../ducks/user.duck';
import { storableError } from '../../util/errors';

// ================ Async Thunks ================ //

const loadDataPayloadCreator = (_, thunkAPI) => {
  const { getState, extra: sdk } = thunkAPI;
  let currentUser = getState().user.currentUser;
  const { isAuthenticated } = getState().auth;

  if (!currentUser && isAuthenticated) {
    return sdk.currentUser.show().then(response => {
      currentUser = denormalisedResponseEntities(response)[0];
      const shippingAddress = get(
        currentUser,
        'attributes.profile.protectedData.shippingAddress',
        null
      );
      return shippingAddress || null;
    });
  }

  const shippingAddress = get(
    currentUser,
    'attributes.profile.protectedData.shippingAddress',
    null
  );
  return Promise.resolve(shippingAddress);
};

export const loadDataThunk = createAsyncThunk(
  'ShippingAddressForm/loadData',
  loadDataPayloadCreator
);

// Backward compatible wrapper
export const loadData = () => (dispatch, getState, sdk) => {
  return dispatch(loadDataThunk()).unwrap();
};

export const updateShippingAddressThunk = createAsyncThunk(
  'ShippingAddressForm/updateShippingAddress',
  async (address, { dispatch }) => {
    const response = await dispatch(
      updateCurrentUserProfileThunk({
        data: { protectedData: { shippingAddress: address } },
        options: { expand: true },
      })
    ).unwrap();
    return response;
  },
  {
    serializeError: storableError,
  }
);

// ================ Slice ================ //

const shippingAddressFormSlice = createSlice({
  name: 'ShippingAddressForm',
  initialState: {
    initialValues: {},
    updateShippingAddressInProgress: false,
    updateShippingAddressSuccess: null,
    updateShippingAddressError: null,
  },
  reducers: {},
  extraReducers: builder => {
    builder
      // loadData
      .addCase(loadDataThunk.fulfilled, (state, action) => {
        if (action.payload) {
          state.initialValues = action.payload;
        }
      })
      // updateShippingAddress
      .addCase(updateShippingAddressThunk.pending, state => {
        state.updateShippingAddressInProgress = true;
        state.updateShippingAddressSuccess = null;
        state.updateShippingAddressError = null;
      })
      .addCase(updateShippingAddressThunk.fulfilled, state => {
        state.updateShippingAddressInProgress = false;
        state.updateShippingAddressSuccess = true;
      })
      .addCase(updateShippingAddressThunk.rejected, (state, action) => {
        state.updateShippingAddressInProgress = false;
        state.updateShippingAddressError = action.payload;
      });
  },
});

export default shippingAddressFormSlice.reducer;
