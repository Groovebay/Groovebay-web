const { transactionLineItems } = require('../api-util/lineItems');
const { getSdk, handleError, serialize, fetchCommission } = require('../api-util/sdk');
const { constructValidLineItems } = require('../api-util/lineItemHelpers');
const { fetchListingsAndCommission } = require('../api-util/helpers');

module.exports = async (req, res) => {
  const { isOwnListing, listingId, orderData } = req.body;

  const sdk = getSdk(req, res);

  try {
    const { listings, commissionAsset } = await fetchListingsAndCommission(
      sdk,
      orderData,
      {
        params: { listingId },
      },
      isOwnListing
    );

    const { providerCommission, customerCommission } =
      commissionAsset?.type === 'jsonAsset' ? commissionAsset.attributes.data : {};

    const lineItems = transactionLineItems(
      listings,
      orderData,
      providerCommission,
      customerCommission
    );

    // Because we are using returned lineItems directly in this template we need to use the helper function
    // to add some attributes like lineTotal and reversal that Marketplace API also adds to the response.
    const validLineItems = constructValidLineItems(lineItems);

    res
      .status(200)
      .set('Content-Type', 'application/transit+json')
      .send(serialize({ data: validLineItems }))
      .end();
  } catch (e) {
    handleError(res, e);
  }
};
