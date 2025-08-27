// src/repositories/user.repo.js
const prisma = require('../config/prisma'); // 너가 쓰는 경로 그대로

async function isIdTaken(id) {
  const found = await prisma.user.findUnique({
    where: { id },
    select: { id: true },
  });
  return !!found;
}

async function findByIdField(id) {
  return prisma.user.findUnique({
    where: { id },
    select: { userID: true, id: true, name: true },
  });
}

async function findByIdWithPassword(id) {
  return prisma.user.findUnique({
    where: { id },
    select: { userID: true, id: true, name: true, password: true },
  });
}

async function create({ id, name, password }) {
  // 서비스에서 이미 해시 처리했다는 전제(해시 안돼서 오면 에러)
  if (typeof password !== 'string' || password.length === 0) {
    const e = new Error('회원가입에 필요한 비밀번호가 없습니다.');
    e.status = 400;
    throw e;
  }
  if (!id) {
    const e = new Error('회원가입에 필요한 아이디가 없습니다.');
    e.status = 400;
    throw e;
  }

  return prisma.user.create({
    data: { id, name, password }, // <- 해시된 비번 그대로 저장
    select: { userID: true, id: true, name: true },
  });
}

async function findByUserObjectId(userID) {
  return prisma.user.findUnique({
    where: { userID },
    select: { userID: true, id: true, name: true },
  });
}

// 🚫 함수 바깥에서 id/name/password 같은 식별자 참조 금지 (ReferenceError 방지)
module.exports = {
  isIdTaken,
  findByIdField,
  findByIdWithPassword,
  create,
  findByUserObjectId,
};
