// src/controllers/letter.controller.js
const svc = require("../services/letter.service");
const mailboxSvc = require("../services/mailbox.service");

// 공통: 현재 로그인 유저ID 문자열로 얻기 (없으면 빈 문자열)
function getUserId(req) {
  const raw =
    req.userId ??     // authGuard가 넣어준 경우
    req.user?.id ??   // 다른 미들웨어 케이스
    req.user?.userId ??
    "";
  return raw ? String(raw) : "";
}

// 숫자 ID 파싱 유틸(양의 정수만 허용)
function toIntId(v) {
  const n = Number(v);
  return Number.isInteger(n) && n > 0 ? n : NaN;
}

// --------------------
// 편지 생성 (두 번째의 상세 로깅/검증 + 첫 번째의 body 매핑 유지)
// --------------------
const create = async (req, res, next) => {
  try {
    const { mailboxId, title, content, to, from, lat, lng, password } = req.body;

    // 민감정보(password)는 로그에 남기지 않음
    console.log("[letter] create", {
      mailboxId,
      hasTitle: !!title,
      hasTo: !!to,
      hasFrom: !!from,
      lat,
      lng,
    });

    // 위치 검증
    if (lat == null || lng == null) {
      const e = new Error("현재 위치(lat,lng)가 필요합니다.");
      e.status = 400;
      throw e;
    }

    // mailboxId(Int) 변환 및 검증
    const mailboxIdNum = toIntId(mailboxId);
    if (!Number.isFinite(mailboxIdNum)) {
      const e = new Error("mailboxId가 올바르지 않습니다.");
      e.status = 400;
      throw e;
    }

    // 거리/비밀번호 접근 검증
    await mailboxSvc.requireAccess({
      req,
      mailboxId: mailboxIdNum,
      userLat: Number(lat),
      userLng: Number(lng),
      password,
    });

    // 로그인 (필요시 강제)
    const authorId = getUserId(req);
    if (process.env.REQUIRE_LOGIN_FOR_LETTER === "1" && !authorId) {
      const e = new Error("로그인이 필요합니다.");
      e.status = 401;
      throw e;
    }

    // to/from 검증 (옵션) — 필요시 환경변수로 강제
    if (process.env.REQUIRE_TO_FROM === "1") {
      if (!to?.trim() || !from?.trim()) {
        const e = new Error("to, from은 비워둘 수 없습니다.");
        e.status = 400;
        throw e;
      }
    }

    // 서비스 쪽에서 body 필드를 쓰므로 content -> body 매핑
    const r = await svc.create({
      mailboxId: mailboxIdNum,
      title,
      body: content,               // ✅ 첫 번째 버전 호환
      authorId: authorId || null,  // 로그인 없으면 null 허용(스키마가 허용한다면)
      // to, from은 서비스가 무시할 수 있음(스키마/서비스에 따라 선택적으로 사용)
      to: to?.trim(),
      from: from?.trim(),
    });

    return res.status(201).json(r);
  } catch (e) {
    next(e);
  }
};

// --------------------
// 편지함 내 목록 (첫 번째의 강한 ID/파라미터 검증)
// --------------------
const listInMailbox = async (req, res, next) => {
  try {
    const mailboxId = toIntId(req.params.id);
    if (!Number.isFinite(mailboxId)) {
      const e = new Error("유효하지 않은 편지함 ID입니다.");
      e.status = 400;
      throw e;
    }

    const { lat, lng, password } = req.query;
    const limit = Number(req.query.limit ?? 50);
    const offset = Number(req.query.offset ?? 0);

    if (lat == null || lng == null) {
      const e = new Error("현재 위치(lat,lng)가 필요합니다.");
      e.status = 400;
      throw e;
    }

    await mailboxSvc.requireAccess({
      req,
      mailboxId,
      userLat: Number(lat),
      userLng: Number(lng),
      password,
    });

    const items = await svc.listInMailbox(mailboxId, { limit, offset });
    res.json({ items });
  } catch (e) {
    next(e);
  }
};

// --------------------
// 편지 단건 조회
// - 접근 검증/로깅(두 번째)
// - 응답은 프론트 계약에 맞춘 정규화(body/date/to/from) + 호환 필드(content/createdAt 등) 함께 제공(통합)
// --------------------
const getOne = async (req, res, next) => {
  try {
    const letterId = toIntId(req.params.id);
    const { lat, lng, password } = req.query;

    console.log("[letter] getOne", { id: req.params.id, lat, lng });

    if (!Number.isFinite(letterId)) {
      const e = new Error("유효하지 않은 편지 ID입니다.");
      e.status = 400;
      throw e;
    }
    if (lat == null || lng == null) {
      const e = new Error("현재 위치(lat,lng)가 필요합니다.");
      e.status = 400;
      throw e;
    }

    const letter = await svc.getById(letterId); // 서비스가 404 던짐
    if (!letter?.mailboxId && letter?.mailboxId !== 0) {
      const e = new Error("편지함 정보가 누락되었습니다.");
      e.status = 500;
      throw e;
    }

    await mailboxSvc.requireAccess({
      mailboxId: Number(letter.mailboxId),
      req,
      userLat: Number(lat),
      userLng: Number(lng),
      password,
    });

    // 프론트 호환용 정규화 + 두 번째 스타일 호환 필드 동시 제공
    const normalized = {
      id: letter.id,
      title: letter.title,
      body: letter.body ?? "내용 없음",          // ✅ 프론트 계약
      date: letter.date ?? "날짜 없음",          // ✅ 프론트 계약 (YYYY-MM-DD)
      to: letter.to ?? "To.",
      from: letter.from ?? "From.",
    };

    const compat = {
      content: normalized.body,                  // 두 번째가 기대하던 content
      createdAt: normalized.date,                // 문자열(정확한 Date가 필요하면 서비스에서 추가로 반환하도록 개선)
      mailboxId: letter.mailboxId,
      authorId: letter.authorId ?? null,         // 서비스가 채워주면 사용, 없으면 null
    };

    const response = { ...normalized, ...compat };
    console.log("[letter] getOne response", {
      id: response.id,
      mailboxId: response.mailboxId,
      hasTo: !!response.to,
      hasFrom: !!response.from,
    });

    res.json(response);
  } catch (e) {
    console.error("[letter] getOne error:", e.message);
    next(e);
  }
};

// --------------------
// ✅ 편지 북마크 추가 (idempotent) — 첫 번째 방식 + created 플래그 유지
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

    const letterId = toIntId(req.params.id);
    if (!Number.isFinite(letterId)) {
      const e = new Error("유효하지 않은 편지 ID입니다.");
      e.status = 400;
      throw e;
    }

    const { created, saved } = await svc.bookmark({ userId, letterId });
    return res.status(created ? 201 : 200).json({
      ok: true,
      created,                   // ✅ 새로 생성 여부
      savedLetterId: saved?.id,
      message: created ? "북마크 완료" : "이미 북마크되어 있습니다",
    });
  } catch (err) {
    next(err);
  }
};

// --------------------
// ✅ 편지 북마크 삭제 (idempotent) — 항상 200 JSON(프론트 파싱 안전)
// DELETE /letters/:id/bookmark
// --------------------
const unbookmark = async (req, res, next) => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      const e = new Error("로그인이 필요합니다.");
      e.status = 401;
      throw e;
    }

    const letterId = toIntId(req.params.id);
    if (!Number.isFinite(letterId)) {
      const e = new Error("유효하지 않은 편지 ID입니다.");
      e.status = 400;
      throw e;
    }

    const result = await svc.unbookmark({ userId, letterId });
    const removed =
      typeof result === "object" && result && "count" in result
        ? Number(result.count) > 0
        : true;

    return res.status(200).json({ ok: true, removed });
  } catch (err) {
    next(err);
  }
};

// --------------------
// ✅ 북마크 여부 확인 (초기 동기화용) — 첫 번째 방식
// GET /letters/:id/bookmark
// --------------------
const isBookmarked = async (req, res, next) => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      const e = new Error("로그인이 필요합니다.");
      e.status = 401;
      throw e;
    }

    const letterId = toIntId(req.params.id);
    if (!Number.isFinite(letterId)) {
      const e = new Error("유효하지 않은 편지 ID입니다.");
      e.status = 400;
      throw e;
    }

    const saved = await svc.isBookmarked({ userId, letterId });
    return res.json({ ok: true, saved, letterId });
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
  isBookmarked,
};
