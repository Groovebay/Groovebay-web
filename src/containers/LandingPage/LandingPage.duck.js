import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { fetchPageAssets } from '../../ducks/hostedAssets.duck';
import { addMarketplaceEntities, getListingsById } from '../../ducks/marketplaceData.duck';
import { storableError } from '../../util/errors';
import { getImageVariantInfo } from '../EditListingPage/EditListingPage.duck';

export const ASSET_NAME = 'landing-page';

// (Re)defined constants & helpers that were implicit in legacy code
const PER_PAGE = 24; // Fallback page size; adjust if needed

// Helper to transform response to listing id array
const responseListingIds = data => data.data.map(l => l.id);

// Build default search params for listings
const getDefaultParams = config => {
  const imageVariantInfo = getImageVariantInfo(config.layout.listingImage);

  return {
    include: ['author', 'images'],
    'fields.listing': [
      'title',
      'geolocation',
      'price',
      'deleted',
      'state',
      'publicData.listingType',
      'publicData.transactionProcessAlias',
      'publicData.unitType',
      'publicData.cardStyle',
      'publicData.pickupEnabled',
      'publicData.shippingEnabled',
      'publicData.priceVariationsEnabled',
      'publicData.priceVariants',
    ],
    'fields.user': ['profile.displayName', 'profile.abbreviatedName'],
    'fields.image': imageVariantInfo.fieldsImage,
    ...imageVariantInfo.imageVariants,
    'limit.images': 1,
    perPage: PER_PAGE,
  };
};

// ================ Async thunks ================ //

export const searchFeaturedListings = createAsyncThunk(
  'landingPage/searchFeaturedListings',
  async (config, { dispatch, rejectWithValue, extra: sdk }) => {
    try {
      const response = await sdk.listings.query({
        ...getDefaultParams(config),
        pub_featured: true,
      });
      const listingFields = config?.listing?.listingFields;
      const sanitizeConfig = { listingFields };

      dispatch(addMarketplaceEntities(response, sanitizeConfig));
      return responseListingIds(response.data);
    } catch (e) {
      return rejectWithValue(storableError(e));
    }
  },
  { serializeError: storableError }
);

export const searchRecentListings = createAsyncThunk(
  'landingPage/searchRecentListings',
  async (config, { dispatch, rejectWithValue, extra: sdk }) => {
    try {
      const response = await sdk.listings.query({
        ...getDefaultParams(config),
      });
      const listingFields = config?.listing?.listingFields;
      const sanitizeConfig = { listingFields };

      dispatch(addMarketplaceEntities(response, sanitizeConfig));
      return responseListingIds(response.data);
    } catch (e) {
      return rejectWithValue(storableError(e));
    }
  },
  { serializeError: storableError }
);

// ================ Page asset loader ================ //
export const loadData = () => dispatch => {
  const pageAsset = { landingPage: `content/pages/${ASSET_NAME}.json` };
  return dispatch(fetchPageAssets(pageAsset, true));
};

// ================ Slice ================ //

const initialState = {
  featuredListingIds: [],
  featuredListingsInProgress: false,
  featuredListingsError: null,
  recentListingIds: [],
  recentListingsInProgress: false,
  recentListingsError: null,
};

const landingPageSlice = createSlice({
  name: 'landingPage',
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder
      // Featured listings
      .addCase(searchFeaturedListings.pending, state => {
        state.featuredListingsInProgress = true;
        state.featuredListingsError = null;
      })
      .addCase(searchFeaturedListings.fulfilled, (state, action) => {
        state.featuredListingsInProgress = false;
        state.featuredListingIds = action.payload;
      })
      .addCase(searchFeaturedListings.rejected, (state, action) => {
        state.featuredListingsInProgress = false;
        state.featuredListingsError = action.payload;
      })
      .addCase(searchRecentListings.pending, state => {
        state.recentListingsInProgress = true;
        state.recentListingsError = null;
      })
      .addCase(searchRecentListings.fulfilled, (state, action) => {
        state.recentListingsInProgress = false;
        state.recentListingIds = action.payload;
      })
      .addCase(searchRecentListings.rejected, (state, action) => {
        state.recentListingsInProgress = false;
        state.recentListingsError = action.payload;
      });
  },
});

export default landingPageSlice.reducer;

export const customListingsSelector = (state, id) =>
  getListingsById(
    state,
    state.LandingPage[id === 'featured-listings' ? 'featuredListingIds' : 'recentListingIds'] || []
  ) || [];
export const customInProgressSelector = (state, id) =>
  state.LandingPage[
    id === 'featured-listings' ? 'featuredListingsInProgress' : 'recentListingsInProgress'
  ] || false;
