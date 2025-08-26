// src/middlewares/authGuard.js
const { verify } = require("../utils/jwt");

function authGuard(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith("Bearer ")) {
    return res.status(401).json({ message: "인증 토큰이 필요합니다." });
  }
  const token = auth.split(" ")[1];
  try {
    const payload = verify(token); // { sub: userId } 형태라고 가정
    req.user = { id: payload.sub };
    next();
  } catch {
    return res.status(401).json({ message: "유효하지 않은 토큰입니다." });
  }
}
module.exports = authGuard; // ✅ 함수 export
