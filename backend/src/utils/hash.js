const bcrypt = require('bcrypt');
const SALT = 10;
const hash = (s) => bcrypt.hash(s, SALT);
const compare = (s, h) => bcrypt.compare(s, h);
module.exports = { hash, compare };
