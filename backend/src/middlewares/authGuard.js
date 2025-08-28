// src/middlewares/authGuard.js
const jwt = require('jsonwebtoken');

module.exports = function authGuard(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ message: '토큰이 없습니다.' });

  const token = auth.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // Prisma User의 PK: userID(ObjectId 문자열)
    req.userId = decoded.sub;
    next();
  } catch {
    res.status(401).json({ message: '유효하지 않은 토큰' });
  }
};
