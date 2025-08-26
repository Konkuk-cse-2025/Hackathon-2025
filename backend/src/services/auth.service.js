const userRepo = require('../repositories/user.repo');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

function signToken(userId) {
  return jwt.sign({ sub: userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
}

async function signup({ id, name, password }) {
  console.log('[service → repo payload]', { id, name, hasPassword: typeof password === 'string' }); // ← 함수 내부 OK
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

  const user = await userRepo.create({ id, name, password });
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
  const user = await userRepo.findByUserObjectId(userID);
  if (!user) {
    const e = new Error('사용자를 찾을 수 없습니다.');
    e.status = 404;
    throw e;
  }
  return user;
}

module.exports = { signup, login, getMyProfile };
