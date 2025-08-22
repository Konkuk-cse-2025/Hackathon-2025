// src/utils/hash.js
const bcrypt = require('bcryptjs'); // npm i bcryptjs

async function hash(plain) {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(plain, salt);
}

async function compare(plain, hashed) {
  if (!hashed) return false;
  return bcrypt.compare(plain, hashed);
}

module.exports = { hash, compare }; // ✅ CommonJS로 내보내기
