// backend/src/services/letter.service.js

// 기존 의존성 (유지)
const letterRepo = require("../repositories/letter.repo");
const mailboxRepo = require("../repositories/mailbox.repo");

// ✅ 추가: DB 직접 확인용
const prisma = require("../../prisma/client");
// ✅ 추가: SavedLetter 전용 Repo
const savedRepo = require("../repositories/savedLetter.repo");

async function create({ mailboxId, authorId, title, content }) {
  if (!mailboxId || !title || !content) {
    const e = new Error("mailboxId,title,content 필요");
    e.status = 400;
    throw e;
  }
  const mb = await mailboxRepo.findById(mailboxId);
  if (!mb) {
    const e = new Error("편지함 없음");
    e.status = 404;
    throw e;
  }
  return letterRepo.create({
    mailboxId: Number(mailboxId),
    authorId: authorId ? String(authorId) : null, // ← 기존 로직 유지 (스키마 타입에 맞게)
    title,
    content,
  });
}

const listInMailbox = (mailboxId, p = {}) =>
  letterRepo.findByMailbox(
    mailboxId,
    Number(p.limit || 50),
    Number(p.offset || 0)
  );

async function getById(id) {
  console.log("Fetching letter with ID:", id);

  const letter = await prisma.letter.findUnique({
    where: { id: Number(id) },
    include: {
      mailbox: true,
      author: true,
    },
  });

  console.log("Letter fetched from database:", letter);

  if (!letter) {
    const e = new Error("존재하지 않는 편지입니다.");
    e.status = 404;
    throw e;
  }

  return {
    id: letter.id,
    mailboxId: letter.mailbox?.id ?? null,
    title: letter.title,
    body: letter.content,
    date: letter.createdAt.toISOString().split("T")[0],
    to: letter.mailbox?.name ?? "To.", // 편지함 이름
    from: letter.author?.name ?? "익명", // 작성자 이름 (없으면 "익명")
  };
}

// 편지 존재/ID 유효성 검사
async function ensureLetterExists(letterId) {
  const id = Number(letterId);
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

// POST /letters/:id/bookmark
async function bookmark({ userId, letterId }) {
  const id = await ensureLetterExists(letterId);
  const already = await savedRepo.exists({ userId, letterId: id });
  const saved = await savedRepo.upsert({ userId, letterId: id }); // 이미 있으면 그대로, 없으면 생성
  return { created: !already, saved };
}

async function isBookmarked({ userId, letterId }) {
  // letterId 유효성 검사
  const id = await ensureLetterExists(letterId);

  // 해당 편지가 특정 사용자에 의해 북마크되었는지 확인
  const saved = await savedRepo.exists({ userId, letterId: id });

  return saved;
}

// DELETE /letters/:id/bookmark
async function unbookmark({ userId, letterId }) {
  const id = await ensureLetterExists(letterId);
  const already = await savedRepo.exists({ userId, letterId: id });
  if (!already) return { deleted: false }; // 멱등성 보장
  await savedRepo.remove({ userId, letterId: id });
  return { deleted: true };
}
  async function listByAuthor({ userId, limit = 50, offset = 0 }) {
      if (!userId) {
        const e = new Error("userId 필요");
        e.status = 400;
        throw e;
      }
      const items = await prisma.letter.findMany({
        where: { authorId: String(userId) },
        orderBy: { createdAt: "desc" },
        take: Number(limit),
        skip: Number(offset),
        select: {
          id: true,
          title: true,
          content: true,
          createdAt: true,
          mailboxId: true,
          mailbox: { select: { id: true, name: true } }, // (선택) 편지함 정보도 함께
        },
      });
      // 프론트가 그대로 매핑할 수 있게 원시 필드 유지 (content/createdAt)
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
