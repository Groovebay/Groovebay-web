const getAll = require('./getAll');

const get = async rateId => {
  const rates = await getAll();
  return rates.find(rate => rate.id === rateId);
};

module.exports = get;
