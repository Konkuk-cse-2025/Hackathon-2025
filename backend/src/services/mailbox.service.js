// src/services/mailbox.service.js
const {
  makeBoundingBox,
  haversineDistanceMeters,
  isWithinMeters,
} = require("../utils/geo");
const { hash, compare } = require("../utils/hash");
const mailboxRepo = require("../repositories/mailbox.repo");

async function createMailbox({
  ownerId,
  name,
  type,
  lat,
  lng,
  password,
  hint,
}) {
  if (!ownerId) {
    const e = new Error("ownerId 필요");
    e.status = 401;
    throw e;
  }
  if (!name || !type || lat == null || lng == null) {
    const e = new Error("name, type, lat, lng 필요");
    e.status = 400;
    throw e;
  }

  let passwordHash = null;
  if (type === "SECRET") {
    if (!password) {
      const e = new Error("SECRET는 password 필요");
      e.status = 400;
      throw e;
    }
    passwordHash = await hash(password);
  }

  return mailboxRepo.create({
    ownerId,
    name,
    type,
    lat: Number(lat),
    lng: Number(lng),
    hint: hint || null,
    passwordHash,
  });
}

async function listNearby({ lat, lng, radius = 1000 }) {
  const latN = Number(lat);
  const lngN = Number(lng);
  const rN = Number(radius) || 1000;

  // ✅ 순서 수정: bounds 계산 → 후보 조회
  const bounds = makeBoundingBox(latN, lngN, rN);

  const candidates = await mailboxRepo.findInBounds(bounds);

  return candidates
    .map((m) => ({
      ...m,
      distanceMeters: haversineDistanceMeters(latN, lngN, m.lat, m.lng),
    }))
    .filter((m) => m.distanceMeters <= rN)
    .sort((a, b) => a.distanceMeters - b.distanceMeters);
}

// 요청마다: 거리 100m + (SECRET이면) 비번 검증
async function requireAccessSimple({ mailboxId, userLat, userLng, password }) {
  const mb = await mailboxRepo.findById(mailboxId);
  if (!mb) {
    const e = new Error("존재하지 않는 편지함입니다.");
    e.status = 404;
    throw e;
  }

  const near = isWithinMeters(
    Number(userLat),
    Number(userLng),
    mb.lat,
    mb.lng,
    100
  );
  if (!near) {
    const e = new Error("현재 위치가 100m 이내가 아니어서 열 수 없습니다.");
    e.status = 401;
    throw e;
  }

  if (mb.type === "SECRET") {
    const ok = await compare(password || "", mb.passwordHash || "");
    if (!ok) {
      const e = new Error("비밀번호가 일치하지 않습니다.");
      e.status = 401;
      throw e;
    }
  }

  return mb;
}

// 요청: { mailboxId, userLat, userLng, password }
// 응답: { ok: true, access: true, distanceMeters }
async function gate({ mailboxId, userLat, userLng, password }) {
  const mb = await requireAccessSimple({
    mailboxId,
    userLat,
    userLng,
    password,
  });

  const distanceMeters = haversineDistanceMeters(
    Number(userLat),
    Number(userLng),
    mb.lat,
    mb.lng
  );

  return { ok: true, access: true, distanceMeters };
}

module.exports = {
  createMailbox,
  listNearby,
  requireAccessSimple,
  gate,
};
