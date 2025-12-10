const { denormalisedResponseEntities } = require('../../api-util/format');
const { getIntegrationSdk } = require('../../api-util/sdk');
const integrationSdk = getIntegrationSdk();

module.exports = async (id, options) => {
  const response = await integrationSdk.users.show({ id, ...options });
  const [user] = denormalisedResponseEntities(response);
  return user;
};
