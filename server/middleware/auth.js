const { getSdk } = require('../api-util/sdk');

const authUser = async (req, res, next) => {
  const sdk = getSdk(req, res);
  const user = await sdk.currentUser.show();
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  req.sharetribeUser = user;
  next();
};

module.exports = authUser;
