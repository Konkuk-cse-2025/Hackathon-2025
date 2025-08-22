// src/services/mailbox.service.js
const { makeBoundingBox, haversineDistanceMeters, isWithinMeters } = require('../utils/geo');
const { hash, compare } = require('../utils/hash');
const mailboxRepo = require('../repositories/mailbox.repo');

async function createMailbox({ name, type, lat, lng, password, hint }) {
  if (!name || !type || lat == null || lng == null) {
    const e = new Error('name, type, lat, lng 필요');
    e.status = 400;
    throw e;
  }

  let passwordHash = null;
  if (type === 'SECRET') {
    if (!password) {
      const e = new Error('SECRET는 password 필요');
      e.status = 400;
      throw e;
    }
    passwordHash = await hash(password);
  }

  return mailboxRepo.create({
    name,
    type,
    lat: Number(lat),
    lng: Number(lng),
    hint: hint || null,
    passwordHash,
  });
}

async function listNearby({ lat, lng, radius = 1 }) {
  const center = { lat: Number(lat), lng: Number(lng) };
  const bounds = makeBoundingBox(center.lat, center.lng, Number(radius));
  const candidates = await mailboxRepo.findInBounds(bounds);

  return candidates
    .map((m) => ({
      ...m,
      distanceMeters: haversineDistanceMeters(center.lat, center.lng, m.lat, m.lng),
    }))
    .filter((m) => m.distanceMeters <= radius * 1000)
    .sort((a, b) => a.distanceMeters - b.distanceMeters);
}

// 요청마다: 거리 100m + (SECRET이면) 비번 검증
async function requireAccessSimple({ mailboxId, userLat, userLng, password }) {
  const mb = await mailboxRepo.findById(mailboxId);
  if (!mb) {
    const e = new Error('존재하지 않는 편지함입니다.');
    e.status = 404;
    throw e;
  }

  const near = isWithinMeters(Number(userLat), Number(userLng), mb.lat, mb.lng, 100);
  if (!near) {
    const e = new Error('현재 위치가 100m 이내가 아니어서 열 수 없습니다.');
    e.status = 401;
    throw e;
  }

  if (mb.type === 'SECRET') {
    const ok = await compare(password || '', mb.passwordHash || '');
    if (!ok) {
      const e = new Error('비밀번호가 일치하지 않습니다.');
      e.status = 401;
      throw e;
    }
  }

  return mb;
}

module.exports = {
  createMailbox,
  listNearby,
  requireAccessSimple, // ✅ 이거 export
};
