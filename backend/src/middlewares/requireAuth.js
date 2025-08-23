const jwt = require('jsonwebtoken');

module.exports = function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const [type, token] = header.split(' ');

  if (type !== 'Bearer' || !token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = payload; // JWT 페이로드에서 id, name 세팅
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid token' });
  }
};
