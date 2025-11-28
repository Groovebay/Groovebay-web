const { denormalisedResponseEntities } = require('./format');
const { fetchCommission } = require('./sdk');

const fetchListingsAndCommission = async (sdk, orderData, bodyParams, isOwnListing) => {
  const showSdk = isOwnListing ? sdk.ownListings.show : sdk.listings.show;
  console.log({ orderData });
  const listingPromises = () => {
    if (orderData.providerCart) {
      return Promise.all(
        Object.keys(orderData.providerCart).map(listingId => showSdk({ id: listingId }))
      );
    }
    return Promise.all([showSdk({ id: bodyParams?.params?.listingId })]);
  };

  let listings = [];

  // Fetch listings and commission data
  const [showListingResponses, fetchAssetsResponse] = await Promise.all([
    listingPromises(),
    fetchCommission(sdk),
  ]);

  listings = showListingResponses.map(response => denormalisedResponseEntities(response)[0]);
  const commissionAsset = fetchAssetsResponse.data.data[0];
  return { listings, commissionAsset };
};

module.exports = { fetchListingsAndCommission };
