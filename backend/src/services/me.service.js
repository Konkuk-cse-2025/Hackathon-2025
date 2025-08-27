// src/services/me.service.js
const prisma = require("../config/prisma");

/**
 * 공통: 페이지네이션 유틸 (커서 기반)
 * - client는 nextCursor를 저장했다가 다음 페이지 호출 시 ?cursor=... 로 전달
 */
function buildPagination({ limit, cursor }) {
  const take = Math.min(Math.max(Number(limit) || 20, 1), 50); // 1~50
  const whereCursor = cursor ? { id: cursor } : undefined; // Prisma Mongo: id(String @db.ObjectId)
  return { take, whereCursor };
}

/**
 * summary: 버튼용 숫자만 반환 (리스트는 안 보여줌)
 * - savedCount는 현재 스키마엔 저장관계가 없어 0으로 반환
 */
async function getSummary(userId) {
  const lettersCount = await prisma.letter.count({
    where: { authorId: userId },
  });
  const savedCount = 0; // TODO: 스키마에 Saved(또는 Letter.savers) 추가 시 실제 카운트로 교체
  return { lettersCount, savedCount };
}

/**
 * 내가 쓴 편지
 */
async function getMyLetters(userId, { limit, cursor }) {
  const { take, whereCursor } = buildPagination({ limit, cursor });
  const items = await prisma.letter.findMany({
    where: { authorId: userId },
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    ...(whereCursor && { cursor: whereCursor, skip: 1 }),
    take,
    select: {
      id: true,
      title: true,
      content: true,
      mailboxId: true,
      createdAt: true,
    },
  });

  const nextCursor = items.length === take ? items[items.length - 1].id : null;
  return { items, nextCursor };
}

/**
 * 내가 저장한 편지 (스키마 미구현 상태: 빈 배열)
 * - Saved 관계 추가 후 아래 로직만 교체하면 API 스펙은 그대로 유지됨
 */
async function getSavedLetters(userId, { limit, cursor }) {
  const { take, whereCursor } = buildPagination({ limit, cursor });

  const savedLetters = await prisma.savedLetter.findMany({
    where: { userId: userId },
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    ...(whereCursor && { cursor: whereCursor, skip: 1 }),
    take,
    // SavedLetter 테이블에서 letter 정보를 가져오기 위해 include 사용
    include: {
      letter: {
        select: {
          id: true,
          title: true,
          content: true,
          createdAt: true,
        },
      },
    },
  });

  const items = savedLetters.map((sl) => ({
    savedId: sl.id, // 커서 기준 id
    savedAt: sl.createdAt.toISOString(), // 내가 저장한 날짜
    letter: {
      id: sl.letter.id,
      title: sl.letter.title,
      content: sl.letter.content, // ✅ content로 내려주기
      createdAt: sl.letter.createdAt.toISOString(), // 편지 작성일
    }, // 'createdAt'로 매핑
  }));

  const nextCursor = items.length === take ? items[items.length - 1].id : null;

  return { items, nextCursor };
}

module.exports = {
  getSummary,
  getMyLetters,
  getSavedLetters,
};
