// backend/src/services/letter.service.js

// 기존 의존성
const letterRepo = require("../repositories/letter.repo");
const mailboxRepo = require("../repositories/mailbox.repo");

// DB 직접 접근
const prisma = require("../../prisma/client");
// SavedLetter 전용 Repo
const savedRepo = require("../repositories/savedLetter.repo");

/* ---------------------------------- *
 * 유틸
 * ---------------------------------- */

/** 숫자 ID 강검증 → 양의 정수만 허용 */
function toIntId(v) {
  const n = Number(v);
  return Number.isInteger(n) && n > 0 ? n : NaN;
}

/** ISO 날짜(YYYY-MM-DD)로 변환 */
function toISODateOnly(d) {
  try {
    return new Date(d).toISOString().split("T")[0];
  } catch {
    return new Date().toISOString().split("T")[0];
  }
}

/** 편지 존재/ID 유효성 검사 → 숫자 ID 반환 */
async function ensureLetterExists(letterId) {
  const id = toIntId(letterId);
  if (!Number.isFinite(id)) {
    const e = new Error("잘못된 편지 ID 입니다.");
    e.status = 400;
    throw e;
  }
  const letter = await prisma.letter.findUnique({ where: { id } });
  if (!letter) {
    const e = new Error("편지를 찾을 수 없습니다.");
    e.status = 404;
    throw e;
  }
  return id;
}

/* ---------------------------------- *
 * 서비스 구현
 * ---------------------------------- */

/**
 * 편지 생성 (두 코드 통합)
 * - 컨트롤러가 body 또는 content를 보낼 수 있음 → content 최종 저장
 * - to/from 저장 지원(스키마에 칼럼이 있을 것)
 * - authorId는 선택(스키마가 String?이면 null 허용)
 * - 메일박스 존재 검증
 */
async function create({ mailboxId, authorId, title, body, content, to, from }) {
  const mailboxIdNum = toIntId(mailboxId);
  const finalContent = typeof body === "string" && body.length > 0 ? body : content;

  if (!Number.isFinite(mailboxIdNum) || !title || !finalContent) {
    const e = new Error("mailboxId,title,body(content) 필요");
    e.status = 400;
    throw e;
  }

  const mb = await mailboxRepo.findById(Number(mailboxIdNum));
  if (!mb) {
    const e = new Error("편지함 없음");
    e.status = 404;
    throw e;
  }

  // to/from 필수 여부는 환경변수로 토글 (두 번째 코드 기능)
  if (process.env.REQUIRE_TO_FROM === "1") {
    if (!to?.trim() || !from?.trim()) {
      const e = new Error("to, from은 비워둘 수 없습니다.");
      e.status = 400;
      throw e;
    }
  }

  // authorId: 스키마가 String?이면 null 허용
  const authorIdStr = authorId ? String(authorId) : null;

  // 레포가 to/from을 지원해도 안전, 미지원이어도 무시됨.
  // to/from 보장은 prisma로 직접 저장하는 것이 가장 견고하므로 여기서는 prisma 사용.
  const created = await prisma.letter.create({
    data: {
      mailboxId: mailboxIdNum,
      authorId: authorIdStr,
      title,
      content: finalContent,
      // 스키마에 칼럼이 있는 경우에만 적용됨
      ...(typeof to === "string" ? { to: to.trim() } : {}),
      ...(typeof from === "string" ? { from: from.trim() } : {}),
    },
    select: {
      id: true,
      mailboxId: true,
      authorId: true,
      title: true,
      content: true,
      to: true,
      from: true,
      createdAt: true,
    },
  });

  // 생성 응답은 원시 + 호환 필드 동시 제공
  return {
    // 원시/DB 필드
    id: created.id,
    mailboxId: created.mailboxId,
    authorId: created.authorId,
    title: created.title,
    content: created.content,
    to: created.to ?? null,
    from: created.from ?? null,
    createdAt: created.createdAt,

    // 호환(프론트 계약)
    body: created.content,
    date: toISODateOnly(created.createdAt),
  };
}

/** 편지함 내 목록 (레포 사용) */
const listInMailbox = (mailboxId, p = {}) =>
  letterRepo.findByMailbox(
    Number(mailboxId),
    Number(p.limit ?? 50),
    Number(p.offset ?? 0)
  );

/**
 * 편지 단건 조회
 * - 첫 번째: body/date/to/from 변환
 * - 두 번째: content/createdAt/raw 필드도 함께 제공
 */
async function getById(id) {
  const rec = await prisma.letter.findUnique({
    where: { id: Number(id) },
    include: {
      mailbox: { select: { id: true, name: true } },
      author: { select: { id: true, name: true } },
    },
  });

  if (!rec) {
    const e = new Error("존재하지 않는 편지입니다.");
    e.status = 404;
    throw e;
  }

  return {
    // 프론트 계약(정규화)
    id: rec.id,
    title: rec.title,
    body: rec.content,
    date: toISODateOnly(rec.createdAt ?? new Date()),
    to: rec.to ?? rec.mailbox?.name ?? "To.",
    from: rec.from ?? rec.author?.name ?? "익명",

    // 호환/원시
    mailboxId: rec.mailbox?.id ?? rec.mailboxId ?? null,
    authorId: rec.author?.id ?? rec.authorId ?? null,
    content: rec.content,
    createdAt: rec.createdAt,
  };
}

/** 북마크 추가 (멱등) */
async function bookmark({ userId, letterId }) {
  if (!userId) {
    const e = new Error("userId 필요");
    e.status = 400;
    throw e;
  }
  const id = await ensureLetterExists(letterId);
  const already = await savedRepo.exists({ userId, letterId: id });
  const saved = await savedRepo.upsert({ userId, letterId: id }); // 이미 있으면 유지, 없으면 생성
  return { created: !already, saved };
}

/** 북마크 여부 확인 (boolean) */
async function isBookmarked({ userId, letterId }) {
  if (!userId) {
    const e = new Error("userId 필요");
    e.status = 400;
    throw e;
  }
  const id = await ensureLetterExists(letterId);
  return savedRepo.exists({ userId, letterId: id });
}

/** 북마크 삭제 (멱등) → { count } 반환 */
async function unbookmark({ userId, letterId }) {
  if (!userId) {
    const e = new Error("userId 필요");
    e.status = 400;
    throw e;
  }
  const id = await ensureLetterExists(letterId);
  const { count } = await savedRepo.remove({ userId, letterId: id }); // deleteMany 기반
  return { count };
}

/** 내가 쓴 편지 목록 (to/from 포함, 원시 필드 유지) */
async function listByAuthor({ userId, limit = 50, offset = 0 }) {
  if (!userId) {
    const e = new Error("userId 필요");
    e.status = 400;
    throw e;
  }
  const items = await prisma.letter.findMany({
    where: { authorId: String(userId) },
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    take: Number(limit),
    skip: Number(offset),
    select: {
      id: true,
      title: true,
      content: true,
      to: true,
      from: true,
      createdAt: true,
      mailboxId: true,
      mailbox: { select: { id: true, name: true } },
    },
  });
  // 프론트가 그대로 매핑할 수 있게 원시 필드 유지 (content/createdAt), to/from도 포함
  return items;
}

module.exports = {
  create,
  listInMailbox,
  getById,
  bookmark,
  unbookmark,
  isBookmarked,
  listByAuthor,
};
