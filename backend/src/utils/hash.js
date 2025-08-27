const bcrypt = require('bcryptjs');
module.exports = {
  hash: (plain) => {
    if (typeof plain !== 'string') throw new Error('hash(): plain must be string');
    return bcrypt.hash(plain, 10);
  },
  compare: (plain, hashed) => {
    if (typeof plain !== 'string' || typeof hashed !== 'string') return false;
    return bcrypt.compare(plain, hashed);
  },
};
