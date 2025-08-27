const jwt = require('jsonwebtoken');

module.exports = function requireAuth(req, res, next) {
  try {
    const auth = req.headers.authorization || '';
    const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
    if (!token) {
      const e = new Error('인증 토큰이 없습니다.');
      e.status = 401;
      throw e;
    }
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    // auth.service에서 sub = user.userID 로 넣었음
    req.userId = payload.sub;
    next();
  } catch (e) {
    e.status = e.status || 401;
    next(e);
  }
};
