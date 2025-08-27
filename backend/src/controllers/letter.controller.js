// src/controllers/letter.controller.js
const svc = require("../services/letter.service");
const mailboxSvc = require("../services/mailbox.service");

// 공통: 현재 로그인 유저ID 문자열로 얻기 (없으면 빈 문자열)
function getUserId(req) {
  const raw =
    req.userId ?? // ✅ authGuard
    req.user?.id ?? // 혹시 다른 미들웨어
    req.user?.userId ??
    ""; // 혹시 다른 미들웨어
  return raw ? String(raw) : "";
}

// --------------------
// 편지 생성
// --------------------
const create = async (req, res, next) => {
  try {
    const { mailboxId, title, content, lat, lng, password } = req.body;

    console.log("Creating letter with data:", {
      mailboxId,
      title,
      content,
      lat,
      lng,
      password,
    });

    if (lat == null || lng == null) {
      const e = new Error("현재 위치(lat,lng)가 필요합니다.");
      e.status = 400;
      throw e;
    }

    // 거리 + (SECRET이면) 비번 즉시 검증
    await mailboxSvc.requireAccessSimple({
      mailboxId,
      userLat: lat,
      userLng: lng,
      password,
    });

    // authorId: String? 이므로 문자열 또는 null
    const authorIdRaw = req.user?.userId ?? req.user?.id ?? null;
    const authorId = authorIdRaw ? String(authorIdRaw) : null;

    const r = await svc.create({ mailboxId, title, content, authorId });
    res.status(201).json(r);
  } catch (e) {
    next(e);
  }
};

// --------------------
// 편지함 내 목록
// --------------------
const listInMailbox = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { lat, lng, password, limit, offset } = req.query;

    if (lat == null || lng == null) {
      const e = new Error("현재 위치(lat,lng)가 필요합니다.");
      e.status = 400;
      throw e;
    }

    await mailboxSvc.requireAccessSimple({
      mailboxId: id,
      userLat: lat,
      userLng: lng,
      password,
    });

    const items = await svc.listInMailbox(id, { limit, offset });
    res.json({ items });
  } catch (e) {
    next(e);
  }
};

// --------------------
// 편지 단건 조회
// --------------------
const getOne = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { lat, lng, password } = req.query;

    console.log("Received request for letter:", { id, lat, lng, password }); // 요청 데이터 로그

    if (!id || !Number.isFinite(Number(id))) {
      const e = new Error("유효하지 않은 편지 ID입니다.");
      e.status = 400;
      throw e;
    }

    if (lat == null || lng == null) {
      const e = new Error("현재 위치(lat,lng)가 필요합니다.");
      e.status = 400;
      throw e;
    }

    const letter = await svc.getById(id);
    console.log("Fetched letter from database:", letter); // 데이터베이스에서 가져온 데이터 확인

    if (!letter) {
      const e = new Error("존재하지 않는 편지입니다.");
      e.status = 404;
      throw e;
    }

    if (!letter.mailboxId) {
      const e = new Error("편지함 정보가 누락되었습니다.");
      e.status = 500;
      throw e;
    }

    await mailboxSvc.requireAccessSimple({
      mailboxId: letter.mailboxId,
      userLat: lat,
      userLng: lng,
      password,
    });

    const response = {
      id: letter.id,
      title: letter.title,
      body: letter.body ?? "내용 없음",
      date: letter.date ?? "날짜 없음",
      to: letter.to ?? "To.",
      from: letter.from ?? "From.",
    };

    console.log("Response to be sent:", response); // 최종 응답 데이터 확인
    res.json(response);
  } catch (e) {
    console.error("Error in getOne controller:", e.message); // 오류 로그
    next(e);
  }
};

// --------------------
// ✅ 편지 북마크 추가
// POST /letters/:id/bookmark
// --------------------
const bookmark = async (req, res, next) => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      const e = new Error("로그인이 필요합니다.");
      e.status = 401;
      throw e;
    }
    const { id } = req.params;

    // (정확한 created 여부 필요하면 서비스에서 upsert 이전에 조회하도록 변경)
    const { created, saved } = await svc.bookmark({ userId, letterId: id });

    return res.status(created ? 201 : 200).json({
      ok: true,
      message: created ? "북마크 완료" : "이미 북마크 되어 있습니다",
      savedLetterId: saved.id,
    });
  } catch (err) {
    next(err);
  }
};

// ✅ 편지 북마크 삭제
const unbookmark = async (req, res, next) => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      const e = new Error("로그인이 필요합니다.");
      e.status = 401;
      throw e;
    }
    const { id } = req.params;

    await svc.unbookmark({ userId, letterId: id });
    return res.status(204).send();
  } catch (err) {
    next(err);
  }
};

// ✅ 북마크 여부 확인 (초기 상태 동기화용)
const isBookmarked = async (req, res, next) => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      const e = new Error("로그인이 필요합니다.");
      e.status = 401;
      throw e;
    }
    const { id } = req.params;
    const saved = await svc.isBookmarked({ userId, letterId: id });
    return res.json({ ok: true, saved, letterId: Number(id) });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  create,
  listInMailbox,
  getOne,
  bookmark,
  unbookmark,
  isBookmarked, // ← 추가
};
