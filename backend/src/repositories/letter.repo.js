// src/repositories/letter.repo.js
const prisma = require('../../prisma/client');

async function create({ mailboxId, authorId, title, content }) {
  return prisma.letter.create({
    data: {
      mailboxId: Number(mailboxId),
      authorId: authorId != null ? Number(authorId) : null,
      title,
      content
    },
    select: { id: true, mailboxId: true, authorId: true, title: true, content: true, createdAt: true }
  });
}

async function findByMailbox(mailboxId, limit, offset) {
  return prisma.letter.findMany({
    where: { mailboxId: Number(mailboxId) },
    orderBy: { createdAt: 'desc' },
    skip: Number(offset) || 0,
    take: Number(limit) || 50,
    select: { id: true, mailboxId: true, authorId: true, title: true, content: true, createdAt: true }
  });
}

async function findByIdWithMailbox(id) {
  console.log("Fetching letter with mailbox details for ID:", id); // 디버깅 로그 추가

  const letter = await prisma.letter.findUnique({
    where: { id: Number(id) },
    select: {
      id: true,
      mailboxId: true,
      authorId: true,
      title: true,
      content: true,
      createdAt: true,
      mailbox: { select: { id: true, type: true, lat: true, lng: true, passwordHash: true } }
    }
  });

  console.log("Fetched letter with mailbox details:", letter); // 가져온 데이터 확인

  return letter;
}

module.exports = { create, findByMailbox, findByIdWithMailbox };
