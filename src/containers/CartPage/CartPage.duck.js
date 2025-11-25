import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// ================ Slice ================ //

const cartPageSlice = createSlice({
  name: 'CartPage',
  initialState: {
    cart: {},
    lineItemsMap: {},
    currentPageResultIds: [],
    currentAuthor: null,
    currentAuthorDelivery: null,
    pagination: null,
    queryParams: null,
    queryInProgress: false,
    queryListingsError: null,
    lineItemsInProgress: false,
    lineItemsError: null,
    toggleCartInProgress: false,
    toggleCartError: null,
    toggleDeliveryInProgress: false,
    toggleDeliveryError: null,
    authorListingIds: [],
    fetchLineItemsRequestIds: [],
    fetchAllCartLineItemsInProgress: false,
    fetchAllCartLineItemsError: null,
  },
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(loadDataThunk.pending, state => {})
      .addCase(loadDataThunk.fulfilled, (state, action) => {})
      .addCase(loadDataThunk.rejected, (state, action) => {});
  },
});

export default cartPageSlice.reducer;

// ================ Load data ================ //

const loadDataPayloadCreator = (
  { params, search },
  { dispatch, rejectWithValue, extra: sdk }
) => {};

export const loadDataThunk = createAsyncThunk('CartPage/loadData', loadDataPayloadCreator);

// Backward compatible wrapper for the thunk
export const loadData = (params, search) => (dispatch, getState, sdk) => {
  return dispatch(loadDataThunk({ params, search }));
};
