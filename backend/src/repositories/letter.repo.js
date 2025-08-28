// src/repositories/letter.repo.js
const prisma = require('../../prisma/client');

/** ===== 환경설정 =====
 * - AUTHOR_ID_TYPE: 'string' | 'int'  (User.id 타입)
 * - LETTER_HAS_TO_FROM: '1'이면 select에 to/from 포함 (스키마에 필드가 있을 때만!)
 */
const AUTHOR_ID_TYPE = String(process.env.AUTHOR_ID_TYPE || 'string').toLowerCase();
const HAS_TO_FROM = process.env.LETTER_HAS_TO_FROM === '1';

/** authorId를 스키마 타입에 맞게 정규화 */
function normalizeAuthorId(authorId) {
  if (authorId == null) return null;
  return AUTHOR_ID_TYPE === 'int' || AUTHOR_ID_TYPE === 'number'
    ? Number(authorId)
    : String(authorId);
}

/** 공통 select (스키마에 따라 to/from 포함 여부 토글) */
function baseLetterSelect() {
  const sel = {
    id: true,
    mailboxId: true,
    authorId: true,
    title: true,
    content: true,
    createdAt: true,
  };
  if (HAS_TO_FROM) {
    // 스키마에 to/from 칼럼이 있을 때만 켜세요(없으면 Prisma 에러)
    sel.to = true;
    sel.from = true;
  }
  return sel;
}

/**
 * 편지 생성
 * - 두 코드 통합: to/from 저장 지원
 * - authorId는 환경변수에 맞춰 String/Int로 캐스팅
 */
async function create({ mailboxId, authorId, title, content, to, from }) {
  return prisma.letter.create({
    data: {
      mailboxId: Number(mailboxId),
      authorId: normalizeAuthorId(authorId),
      title,
      content,
      // 스키마에 있을 때만 값이 들어가도록 안전하게 전달
      ...(typeof to === 'string' ? { to } : {}),
      ...(typeof from === 'string' ? { from } : {}),
    },
    select: baseLetterSelect(),
  });
}

/**
 * 편지함 내 목록
 * - 첫 번째 코드 기반(select 최소 필드) + 옵션으로 to/from 포함
 */
async function findByMailbox(mailboxId, limit, offset) {
  return prisma.letter.findMany({
    where: { mailboxId: Number(mailboxId) },
    orderBy: { createdAt: 'desc' },
    skip: Number(offset) || 0,
    take: Number(limit) || 50,
    select: baseLetterSelect(),
  });
}

/**
 * 편지 단건(+편지함) 조회
 * - 두 코드 공통 구조 유지 + 디버그 로그
 * - 필요 시 to/from도 select 포함(HAS_TO_FROM)
 */
async function findByIdWithMailbox(id) {
  console.log('Fetching letter with mailbox details for ID:', id);

  const select = {
    ...baseLetterSelect(),
    mailbox: { select: { id: true, type: true, lat: true, lng: true, passwordHash: true } },
  };

  const letter = await prisma.letter.findUnique({
    where: { id: Number(id) },
    select,
  });

  console.log('Fetched letter with mailbox details:', letter);
  return letter;
}

module.exports = { create, findByMailbox, findByIdWithMailbox };
