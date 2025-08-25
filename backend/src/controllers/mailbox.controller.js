const service = require("../services/mailbox.service");

function isFiniteInRange(n, min, max) {
  return Number.isFinite(n) && n >= min && n <= max;
}

const create = async (req, res, next) => {
  try {
    const { name, type, lat, lng, password, passwordHint } = req.body;

    // ✅ 토큰에서 사용자 id → ownerId로 전달
    const ownerId = req.user?.userId;
    console.log("Received ownerId:", ownerId);
    if (!ownerId) return res.status(401).json({ error: "인증 필요" });

    const latN = parseFloat(lat);
    const lngN = parseFloat(lng);
    if (!name || !Number.isFinite(latN) || !Number.isFinite(lngN)) {
      return res.status(400).json({ error: "Invalid name/lat/lng" });
    }

    const r = await service.createMailbox({
      ownerId,
      name,
      type,
      lat: latN,
      lng: lngN,
      password,
      hint: passwordHint,
    });
    res.status(201).json(r);
  } catch (e) {
    next(e);
  }
};

const list = async (req, res, next) => {
  try {
    const lat = parseFloat(req.query.lat);
    const lng = parseFloat(req.query.lng);
    const radius = req.query.radius ? parseInt(req.query.radius, 10) : 1000;

    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      return res.status(400).json({ error: "lat,lng 필요(숫자형)" });
    }
    if (!isFiniteInRange(lat, -90, 90)) {
      return res.status(400).json({ error: "Invalid lat" });
    }
    if (!isFiniteInRange(lng, -180, 180)) {
      return res.status(400).json({ error: "Invalid lng" });
    }
    if (!Number.isFinite(radius) || radius <= 0 || radius > 10000) {
      return res.status(400).json({ error: "Invalid radius" });
    }

    const items = await service.listNearby({ lat, lng, radius });

    // ✅ 프론트가 배열을 기대한다면:
    // res.json(items);
    // 프론트를 {items}로 맞추려면 fetchLetterboxes에서 data.items를 쓰게 바꾸기
    res.json(items);
  } catch (e) {
    next(e);
  }
};

const gate = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { lat, lng, password } = req.body;
    if (lat == null || lng == null) {
      const e = new Error("현재 위치(lat,lng) 필요");
      e.status = 400;
      throw e;
    }
    const r = await service.gate({
      mailboxId: id,
      userLat: lat,
      userLng: lng,
      password,
    });
    res.json(r);
  } catch (e) {
    next(e);
  }
};

module.exports = { create, list, gate };
