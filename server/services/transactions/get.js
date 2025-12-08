const { denormalisedResponseEntities } = require('../../api-util/format');
const { getIntegrationSdk } = require('../../api-util/sdk');

const integrationSdk = getIntegrationSdk();
const get = async (transactionId, options) => {
  const response = await integrationSdk.transactions.show({ id: transactionId, ...options });
  const [transaction] = denormalisedResponseEntities(response);
  return transaction;
};

module.exports = get;
