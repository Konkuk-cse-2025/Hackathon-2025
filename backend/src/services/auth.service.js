// src/services/auth.service.js
const userRepo = require('../repositories/user.repo');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

function signToken(userId) {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET 미설정');
  }
  return jwt.sign({ sub: userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
}

async function signup({ id, name, password }) {
  console.log('[service → repo payload]', { id, name, hasPassword: typeof password === 'string' });
  if (!id || !name || typeof password !== 'string' || password.length === 0) {
    const e = new Error('id, name, password는 필수입니다.');
    e.status = 400;
    throw e;
  }

  const taken = await userRepo.isIdTaken(id);
  if (taken) {
    const e = new Error('이미 사용 중인 아이디입니다.');
    e.status = 400;
    throw e;
  }

  // ✅ 서비스 레이어에서 해시 처리
  const hash = await bcrypt.hash(password, 10);

  // repo.create는 "넘겨준 그대로 저장"만 하도록 가정
  const user = await userRepo.create({ id, name, password: hash });

  const token = signToken(user.userID);
  return { token, user };
}

async function login({ id, password }) {
  if (!id || typeof password !== 'string' || password.length === 0) {
    const e = new Error('id, password는 필수입니다.');
    e.status = 400;
    throw e;
  }

  const u = await userRepo.findByIdWithPassword(id);
  if (!u) {
    const e = new Error('존재하지 않는 아이디입니다.');
    e.status = 404;
    throw e;
  }

  const ok = await bcrypt.compare(password, u.password);
  if (!ok) {
    const e = new Error('비밀번호가 올바르지 않습니다.');
    e.status = 401;
    throw e;
  }

  const token = signToken(u.userID);
  const user = { userID: u.userID, id: u.id, name: u.name };
  return { token, user };
}

async function getMyProfile(userID) {
  // 함수명 그대로 유지 (Mongo 시절 네이밍이지만 Prisma에서도 userID로 조회)
  const user = await userRepo.findByUserObjectId(userID);
  if (!user) {
    const e = new Error('사용자를 찾을 수 없습니다.');
    e.status = 404;
    throw e;
  }
  return user;
}

module.exports = { signup, login, getMyProfile };
