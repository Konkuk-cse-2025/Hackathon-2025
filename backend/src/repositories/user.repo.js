const prisma = require('../config/prisma');
const bcrypt = require('bcryptjs');

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
  // 여기까지 내려왔을 때 undefined면 서비스에서 잘못 넘긴 것
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

  const hashed = await bcrypt.hash(password, 10);
  return prisma.user.create({
    data: { id, name, password: hashed },
    select: { userID: true, id: true, name: true },
  });
}

async function findByUserObjectId(userID) {
  return prisma.user.findUnique({
    where: { userID },
    select: { userID: true, id: true, name: true },
  });
}

console.log('[repo.create args]', { id, name, hasPassword: typeof password === 'string' });

module.exports = {
  isIdTaken,
  findByIdField,
  findByIdWithPassword,
  create,
  findByUserObjectId,
};
