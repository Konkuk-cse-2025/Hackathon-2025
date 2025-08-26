// src/repositories/user.repo.js
// 임시 인메모리 저장소 (서버 재시작하면 초기화됨)
const prisma = require("../config/prisma");
const users = new Map(); // key: id (로그인 아이디), value: user obj

async function isIdTaken(loginId) {
  const found = await prisma.user.findUnique({
    where: { loginId },
    select: { loginId: true },
  });
  return !!found;
}

async function create({ loginId, name, passwordHash, email = null }) {
  const created = await prisma.user.create({
    data: {
      loginId,
      name,
      password: passwordHash,
      email, // 이메일을 안 쓰면 null 가능 (스키마가 String? 일 때)
    },
    select: {
      id: true, // cuid (내부 PK)
      loginId: true, // 로그인용 아이디
      name: true,
    },
  });
  return created;
}

async function getByLoginIdWithPassword(loginId) {
  return prisma.user.findUnique({
    where: { loginId },
    select: {
      id: true, // cuid
      loginId: true,
      name: true,
      password: true, // 해시 포함
    },
  });
}

//async function getByUserId(userId) {
//  for (const u of users.values()) {
//    if (u.userId === userId) return { userId: u.userId, id: u.id, name: u.name };
//  }
//  return null;}

module.exports = {
  isIdTaken,
  create,
  getByLoginIdWithPassword,
};
