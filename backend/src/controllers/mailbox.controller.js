const prisma = require("../config/prisma");                // ✅ 거리검증 시 DB에서 좌표 조회
const service = require("../services/mailbox.service");
const { metersBetween } = require("../utils/distance");

function isFiniteInRange(n, min, max) {
  return Number.isFinite(n) && n >= min && n <= max;
}

// ---------------------------------------------------------
// POST /mailboxes
// body: { name, type, lat, lng, password?, passwordHint?, userLat, userLng }
//  - 규칙: (userLat,userLng) 과 (lat,lng)의 거리가 100m 이내여야 생성 허용
// ---------------------------------------------------------
const create = async (req, res, next) => {
  try {
    const { name, type, lat, lng, password, passwordHint, userLat, userLng } = req.body;
    const ownerId = req.userId || req.user?.sub || req.user?.id || null;

    if (!ownerId) return res.status(401).json({ error: "인증 필요" });
    if (!name) return res.status(400).json({ error: "Invalid name" });

    const latN = Number(lat);
    const lngN = Number(lng);
    const uLatN = Number(userLat);
    const uLngN = Number(userLng);

    if (!Number.isFinite(latN) || !Number.isFinite(lngN))
      return res.status(400).json({ error: "Invalid lat/lng" });
    if (!isFiniteInRange(latN, -90, 90)) return res.status(400).json({ error: "Invalid lat" });
    if (!isFiniteInRange(lngN, -180, 180)) return res.status(400).json({ error: "Invalid lng" });

    // type 검증 (선택)
    if (type && !["OPEN", "SECRET"].includes(type))
      return res.status(400).json({ error: "Invalid mailbox type" });
    if (type === "SECRET" && !password)
      return res.status(400).json({ error: "SECRET 타입은 password 필요" });

    // ✅ 생성 시 사용자 현재 위치 필수 & 100m 이내
    if (!Number.isFinite(uLatN) || !Number.isFinite(uLngN)) {
      return res.status(400).json({ error: "userLat,userLng 필요(숫자형)" });
    }
    const d = metersBetween(
      { lat: uLatN, lng: uLngN },
      { lat: latN, lng: lngN }
    );
    if (d > 100) {
      return res.status(403).json({ error: "거리 초과: 100m 이내에서만 편지함 생성 가능" });
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

// ---------------------------------------------------------
// GET /mailboxes?lat&lng&radius
// (탐색용: 여기서는 거리 제한 없음)
// ---------------------------------------------------------
const list = async (req, res, next) => {
  try {
    const lat = parseFloat(req.query.lat);
    const lng = parseFloat(req.query.lng);
    const radius = req.query.radius ? parseInt(req.query.radius, 10) : 1000;

    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      return res.status(400).json({ error: "lat,lng 필요(숫자형)" });
    }
    if (!isFiniteInRange(lat, -90, 90)) return res.status(400).json({ error: "Invalid lat" });
    if (!isFiniteInRange(lng, -180, 180)) return res.status(400).json({ error: "Invalid lng" });
    if (!Number.isFinite(radius) || radius <= 0 || radius > 10000) {
      return res.status(400).json({ error: "Invalid radius" });
    }

    const items = await service.listNearby({ lat, lng, radius });
    res.json(items); // 프론트가 배열 기대하는 형태 유지
  } catch (e) {
    next(e);
  }
};

// ---------------------------------------------------------
// POST /mailboxes/:id/open
// body: { lat, lng, password? }
//  - 규칙: (요청한 유저 위치)와 (해당 mailbox 좌표)의 거리가 100m 이내여야 열기 허용
// ---------------------------------------------------------
const gate = async (req, res, next) => {
  try {
    const { id } = req.params; // 문자열/숫자 모두 지원
    const { lat, lng, password } = req.body;

    if (lat == null || lng == null) {
      const e = new Error("현재 위치(lat,lng) 필요");
      e.status = 400;
      throw e;
    }

    const uLatN = Number(lat);
    const uLngN = Number(lng);
    if (!Number.isFinite(uLatN) || !Number.isFinite(uLngN)) {
      const e = new Error("Invalid lat/lng");
      e.status = 400;
      throw e;
    }

    // 1) DB에서 mailbox 좌표 조회
    const mailbox = await prisma.mailbox.findUnique({
      where: { id: typeof id === "string" && !Number.isNaN(Number(id)) ? Number(id) : id },
      select: { id: true, lat: true, lng: true }, // 필요한 필드만 가져오기
    });
    if (!mailbox) {
      const e = new Error("해당 편지함을 찾을 수 없습니다.");
      e.status = 404;
      throw e;
    }

    // 2) 거리 검증 (100m 이내)
    const d = metersBetween(
      { lat: uLatN, lng: uLngN },
      { lat: Number(mailbox.lat), lng: Number(mailbox.lng) }
    );
    if (d > 100) {
      const e = new Error("거리 초과: 100m 이내에서만 열 수 있습니다.");
      e.status = 403;
      throw e;
    }

    // 3) 나머지(비밀번호 등) 검증은 서비스에서 수행
    const r = await service.gate({
      req,
      mailboxId: typeof id === "string" && !Number.isNaN(Number(id)) ? Number(id) : id,
      userLat: uLatN,
      userLng: uLngN,
      password,
    });

    res.json(r); // { ok: true } 형태일 것으로 가정
  } catch (e) {
    next(e);
  }
};

module.exports = { create, list, gate };
