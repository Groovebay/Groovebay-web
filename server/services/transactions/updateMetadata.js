const { getIntegrationSdk } = require('../../api-util/sdk');

const integrationSdk = getIntegrationSdk();

const updateMetadata = async (transactionId, metadata) => {
  const transaction = await integrationSdk.transactions.updateMetadata({
    id: transactionId,
    metadata,
  });
  return transaction;
};

module.exports = updateMetadata;
