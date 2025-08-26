// backend/src/controllers/mailbox.controller.js
const service = require('../services/mailbox.service');

// 숫자 파싱 유틸
function toFloat(v) {
  const n = typeof v === 'string' ? parseFloat(v) : Number(v);
  return Number.isFinite(n) ? n : NaN;
}

const create = async (req, res, next) => {
  try {
    // 🔐 토큰에서만 ownerId를 채움 (문자열 유지: B안)
    const ownerId = String(req.user?.id ?? req.user?.userId);
    if (!ownerId) {
      const e = new Error('로그인이 필요합니다.');
      e.status = 401;
      throw e;
    }


    const { name, type, lat, lng, password, hint } = req.body ?? {};

    // ✅ 필수값 체크
    if (!name || !type || lat == null || lng == null) {
      const e = new Error('name, type, lat, lng는 필수입니다.');
      e.status = 400;
      throw e;
    }

    // ✅ 숫자 변환/검증
    const latNum = toFloat(lat);
    const lngNum = toFloat(lng);
    if (Number.isNaN(latNum) || Number.isNaN(lngNum)) {
      const e = new Error('lat/lng는 숫자여야 합니다.');
      e.status = 400;
      throw e;
    }

    const typeUp = String(type).toUpperCase();
    if (!['OPEN', 'SECRET'].includes(typeUp)) {
      const e = new Error("type은 'OPEN' 또는 'SECRET'만 허용됩니다.");
      e.status = 400;
      throw e;
    }
    if (typeUp === 'SECRET' && !password) {
      const e = new Error('비밀 편지함은 password가 필요합니다.');
      e.status = 400;
      throw e;
    }

    // 서비스 호출 (서비스에서 해시/DB 처리)
    const result = await service.createMailbox({
      ownerId,                    // ✅ 문자열 그대로 전달
      name: String(name).trim(),
      type: typeUp,
      lat: latNum,
      lng: lngNum,
      password: password || null,
      hint: hint?.toString().trim() || null,
    });

    return res.status(201).json(result);
  } catch (err) {
    if (err?.code === 'P2003') {
      return res.status(400).json({ message: '유효하지 않은 사용자(ownerId). 다시 로그인 후 시도하세요.' });
    }
    if (err?.code === 'P2002') {
      return res.status(409).json({ message: '이미 존재하는 값이 있습니다.' });
    }
    if (err?.status) {
      return res.status(err.status).json({ message: err.message });
    }
    console.error(err);
    return res.status(500).json({ message: '서버 에러' });
  }
};

const list = async (req, res, next) => {
  try {
    const { lat, lng, radius } = req.query ?? {};

    if (lat == null || lng == null) {
      const e = new Error('lat,lng 필요');
      e.status = 400;
      throw e;
    }

    const latNum = toFloat(lat);
    const lngNum = toFloat(lng);
    if (Number.isNaN(latNum) || Number.isNaN(lngNum)) {
      const e = new Error('lat/lng는 숫자여야 합니다.');
      e.status = 400;
      throw e;
    }

    // radius는 선택값: 기본 1000m
    const rNum = radius == null ? 1000 : toFloat(radius);
    if (!Number.isFinite(rNum) || rNum <= 0) {
      const e = new Error('radius는 양의 숫자여야 합니다.');
      e.status = 400;
      throw e;
    }

    const items = await service.listNearby({ lat: latNum, lng: lngNum, radius: rNum });
    return res.json({ items });
  } catch (err) {
    if (err?.status) {
      return res.status(err.status).json({ message: err.message });
    }
    console.error(err);
    return res.status(500).json({ message: '서버 에러' });
  }
};

const gate = async (req, res, next) => {
  try {
    const { id } = req.params ?? {};
    const { lat, lng, password } = req.body ?? {};

    if (!id) {
      const e = new Error('mailbox id 필요');
      e.status = 400;
      throw e;
    }
    if (lat == null || lng == null) {
      const e = new Error('현재 위치(lat,lng) 필요');
      e.status = 400;
      throw e;
    }

    const latNum = toFloat(lat);
    const lngNum = toFloat(lng);
    if (Number.isNaN(latNum) || Number.isNaN(lngNum)) {
      const e = new Error('lat/lng는 숫자여야 합니다.');
      e.status = 400;
      throw e;
    }

    const result = await service.gate({
      mailboxId: id,              // Mailbox PK는 Int이므로 repo에서 Number(id) 처리 중
      userLat: latNum,
      userLng: lngNum,
      password: password ?? null,
    });

    return res.json(result);
  } catch (err) {
    if (err?.status) {
      return res.status(err.status).json({ message: err.message });
    }
    console.error(err);
    return res.status(500).json({ message: '서버 에러' });
  }
};

module.exports = { create, list, gate };
