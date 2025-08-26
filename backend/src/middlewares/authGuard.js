// backend/src/middlewares/authGuard.js
const { verify } = require('../utils/jwt');

/**
 * Authorization: Bearer <token>
 * 토큰 payload에서 사용자 ID 키는 환경에 따라 다를 수 있어 sub/id/userId 등을 모두 지원.
 * B안(문자열 ID) 기준: req.user.id / req.user.userId 를 문자열로 저장.
 */
function authGuard(req, res, next) {
  const auth = req.headers.authorization || req.get('authorization');

  // 헤더 없음 or 형식 불일치
  if (!auth || !/^Bearer\s+/i.test(auth)) {
    return res.status(401).json({ message: '인증 토큰이 필요합니다.' });
  }

  const token = auth.replace(/^Bearer\s+/i, '').trim();
  if (!token) {
    return res.status(401).json({ message: '인증 토큰이 필요합니다.' });
  }

  try {
    const payload = verify(token); // 구현에 따라 { sub } / { id } / { userId } 등

    // 다양한 키 지원(sub, id, userId)
    const rawId = payload?.sub ?? payload?.id ?? payload?.userId;

    if (rawId == null) {
      return res.status(401).json({ message: '유효하지 않은 토큰입니다. (사용자 ID 없음)' });
    }

    // ✅ B안: 문자열 ID 유지 (절대 Number(...)로 변환하지 않음)
    const uid = String(rawId);

    // 요청 컨텍스트에 저장 (둘 다 채워서 호환성 확보)
    req.user = { id: uid, userId: uid };

    return next();
  } catch (err) {
    // 토큰 만료/검증 실패 등
    return res.status(401).json({ message: '유효하지 않은 토큰입니다.' });
  }
}

module.exports = authGuard;
