// src/controllers/me.controller.js
const meSvc = require('../services/me.service');
const authSvc = require('../services/auth.service'); // ✅ 누락된 import 추가

/** GET /me/summary  - 마이페이지 버튼용 숫자 */
async function summary(req, res, next) {
  try {
    const data = await meSvc.getSummary(req.userId);
    res.json(data);
  } catch (e) { next(e); }
}

/** GET /me/letters?limit&cursor  - 내가 쓴 편지 */
async function getMyLetters(req, res, next) {
  try {
    const limit = req.query.limit ? Number(req.query.limit) : undefined;
    const cursor = req.query.cursor ? String(req.query.cursor) : undefined;
    const data = await meSvc.getMyLetters(req.userId, { limit, cursor });
    res.json(data);
  } catch (e) { next(e); }
}

/** GET /me  - 프로필 */
async function profile(req, res, next) {
  try {
    const user = await authSvc.getMyProfile(req.userId);
    res.json({ user });
  } catch (e) { next(e); }
}

/** GET /me/saved?limit&cursor  - 내가 저장한 편지(현재는 빈 배열 반환 or 서비스 구현) */
async function getSavedLetters(req, res, next) {
  try {
    const limit = req.query.limit ? Number(req.query.limit) : undefined;
    const cursor = req.query.cursor ? String(req.query.cursor) : undefined;
    const data = await meSvc.getSavedLetters(req.userId, { limit, cursor });
    res.json(data);
  } catch (e) { next(e); }
}

module.exports = {
  summary,
  getMyLetters,
  profile,         // ✅ exports에 포함
  getSavedLetters,
};
