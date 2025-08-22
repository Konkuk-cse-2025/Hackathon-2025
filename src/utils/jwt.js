// src/utils/jwt.js
const jwt = require('jsonwebtoken');           // npm i jsonwebtoken
const SECRET = process.env.JWT_SECRET || 'dev-secret';

function sign(payload) {
  return jwt.sign(payload, SECRET, { expiresIn: '7d' });
}

function verify(token) {
  return jwt.verify(token, SECRET);
}

module.exports = { sign, verify };             // ✅ CJS export
