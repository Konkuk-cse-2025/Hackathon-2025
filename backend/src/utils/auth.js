// src/utils/auth.js
const jwt = require('jsonwebtoken');

exports.requireAuth = (req, res, next) => {
  const header = req.headers.authorization || '';
  const [type, token] = header.split(' ');

  if (type !== 'Bearer' || !token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = payload; // { id, name }
    next();
  } catch (e) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};
