// backend/src/services/letter.service.js

// 기존 의존성 (유지)
const letterRepo = require('../repositories/letter.repo');
const mailboxRepo = require('../repositories/mailbox.repo');

// ✅ 추가: DB 직접 확인용
const prisma = require('../../prisma/client');
// ✅ 추가: SavedLetter 전용 Repo
const savedRepo = require('../repositories/savedLetter.repo');

// ---------------------------
// 기존 기능 (그대로 유지)
// ---------------------------
async function create({ mailboxId, authorId, title, content }) {
  if (!mailboxId || !title || !content) {
    const e = new Error('mailboxId,title,content 필요');
    e.status = 400;
    throw e;
  }
  const mb = await mailboxRepo.findById(mailboxId);
  if (!mb) {
    const e = new Error('편지함 없음');
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
  letterRepo.findByMailbox(mailboxId, Number(p.limit || 50), Number(p.offset || 0));

const getById = (id) => letterRepo.findByIdWithMailbox(id);

// ---------------------------
// ✅ 추가: 북마크 기능
// ---------------------------

// 편지 존재/ID 유효성 검사
async function ensureLetterExists(letterId) {
  const id = Number(letterId);
  if (!Number.isFinite(id)) {
    const e = new Error('잘못된 편지 ID 입니다.');
    e.status = 400;
    throw e;
  }
  const letter = await prisma.letter.findUnique({ where: { id } });
  if (!letter) {
    const e = new Error('편지를 찾을 수 없습니다.');
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

// DELETE /letters/:id/bookmark
async function unbookmark({ userId, letterId }) {
  const id = await ensureLetterExists(letterId);
  const already = await savedRepo.exists({ userId, letterId: id });
  if (!already) return { deleted: false }; // 멱등성 보장
  await savedRepo.remove({ userId, letterId: id });
  return { deleted: true };
}

module.exports = {
  // 기존 export 유지
  create,
  listInMailbox,
  getById,

  // ✅ 추가 export
  bookmark,
  unbookmark,
};
