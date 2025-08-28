
// src/services/mailbox.service.js
const {
  makeBoundingBox,
  haversineDistanceMeters,
  isWithinMeters,
} = require("../utils/geo");
const { hash, compare } = require("../utils/hash");
const mailboxRepo = require("../repositories/mailbox.repo");

// --- 유틸: 세션에서 열려있는 편지함 목록 관리 ---
function getOpenedList(req) {
  return (req.session?.openedMailboxes || []).map(String);
}
function addOpened(req, mailboxId) {
  const cur = getOpenedList(req);
  const next = [...new Set([...cur, String(mailboxId)])];
  if (!req.session) req.session = {};
  req.session.openedMailboxes = next;
}

// --- 유틸: 비공개 여부 ---
function isSecretMailbox(mb) {
  // 타입 필드가 'SECRET'이면 비공개
  return mb?.type === "SECRET";
}

// --- 유틸: 거리 체크 ---
async function assertWithinDistance({ mailboxId, userLat, userLng, maxMeters = 10000 }) {
  const mb = await mailboxRepo.findById(Number(mailboxId));
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
    maxMeters
  );
  if (!near) {
    const e = new Error("현재 위치가 100m 이내가 아니어서 열 수 없습니다.");
    e.status = 401; // 접근자격 없음(위치)
    throw e;
  }
  return mb; // 거리 내 편지함 정보 반환
}

async function createMailbox({ ownerId, name, type, lat, lng, password, hint }) {
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

/**
 * ✅ 새 구현: 세션을 활용하는 접근 검사
 * - req 필요(세션 확인/기록)
 * - 공개함: 거리 통과만 하면 OK
 * - 비공개:
 *    1) 이미 세션에 열림 표시가 있으면 OK
 *    2) 없으면 password 검증 → 통과 시 세션에 기록
 */
async function requireAccess({ req, mailboxId, userLat, userLng, password }) {
  console.log("[requireAccess] cookie:", req.headers.cookie);
  console.log("[requireAccess] sessionID:", req.sessionID);
  console.log("[requireAccess] opened before:", req.session?.openedMailboxes);

  const mid = Number(mailboxId);
  if (!Number.isFinite(mid)) {
    const e = new Error("유효하지 않은 mailboxId");
    e.status = 400;
    throw e;
  }

  // 1) 거리 체크 + 박스 로드
  const mb = await assertWithinDistance({
    mailboxId: mid,
    userLat: Number(userLat),
    userLng: Number(userLng),
  });

  // 2) 공개함이면 끝
  if (!isSecretMailbox(mb)) return mb;

  // 3) 세션에 이미 열려 있으면 OK
  const opened = getOpenedList(req);
  if (opened.includes(String(mid))) return mb;

  // 4) 이번 요청에 password가 없으면 401
  if (!password) {
    const e = new Error("비밀번호를 찾을 수 없습니다.");
    e.status = 401;
    throw e;
  }

  // 5) 비번 검증
  const ok = await compare(String(password), mb.passwordHash || "");
  if (!ok) {
    const e = new Error("비밀번호가 올바르지 않습니다.");
    e.status = 403; // 자격은 있으나 인증 실패
    throw e;
  }

  // 6) 통과 시 세션에 기록
  addOpened(req, mid);
  console.log("[requireAccess] opened after:", req.session.openedMailboxes);
  return mb;
}

/**
 * ✅ 게이트: 명시적으로 잠금 해제
 * - 성공 시 세션에 열림 기록
 */
async function gate({ req, mailboxId, userLat, userLng, password }) {
    const mid = Number(mailboxId);
    if (!Number.isFinite(mid)) {
      const e = new Error("유효하지 않은 mailboxId");
      e.status = 400;
      throw e;
    }
  
    // 1) 거리 먼저 확인 + 박스 로드
    const mb = await assertWithinDistance({
      mailboxId: mid,
      userLat: Number(userLat),
      userLng: Number(userLng),
    });

    // 2) 공개함이면 비번 요구 없이 열림 처리
    if (!isSecretMailbox(mb)) {
      addOpened(req, mid);
    } else {
      // 3) 비밀함이면 그때만 password 필요
      if (!password) {
        const e = new Error("비밀번호를 찾을 수 없습니다.");
        e.status = 401; // 프론트가 401/403을 '거리'로 보는 로직이 있으니, 아래에서 분리합니다.
        throw e;
      }
      const ok = await compare(String(password), mb.passwordHash || "");
      if (!ok) {
        const e = new Error("비밀번호가 올바르지 않습니다.");
        e.status = 409; // ✅ 프론트가 '비번 불일치=409'로 처리하고 있음
        throw e;
      }
      addOpened(req, mid);
    }
  
    // 세션 저장 보장 → Set-Cookie 내려가게
    await new Promise((resolve, reject) =>
      req.session.save(err => (err ? reject(err) : resolve()))
    );
  
    const distanceMeters = haversineDistanceMeters(
      Number(userLat), Number(userLng), mb.lat, mb.lng
    );
    return { ok: true, access: true, distanceMeters };
  }

/**
 * ⚠️ 기존 함수: 요청마다 비번을 요구(호환용)
 * - 남겨두되, 컨트롤러/다른 서비스 호출은 가능하면 requireAccess를 쓰도록 전환
 */
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

  if (isSecretMailbox(mb)) {
    const ok = await compare(password || "", mb.passwordHash || "");
    if (!ok) {
      const e = new Error("비밀번호가 일치하지 않습니다.");
      e.status = 401;
      throw e;
    }
  }

  return mb;
}

module.exports = {
  createMailbox,
  listNearby,
  requireAccess,       // ✅ 새로 export
  requireAccessSimple, // (호환용)
  gate,                // ✅ req 사용해 세션 기록
};
