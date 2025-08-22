// src/repositories/user.repo.js
// 임시 인메모리 저장소 (서버 재시작하면 초기화됨)
const users = new Map(); // key: id (로그인 아이디), value: user obj

async function isIdTaken(id) {
  return users.has(id);
}

async function create({ id, name, passwordHash }) {
  const userId = String(Date.now()); // 임시 PK
  const doc = { userId, id, name, password: passwordHash };
  users.set(id, doc);
  return { userId, id, name }; // service가 기대하는 반환 형태
}

async function getById(id) {
  const u = users.get(id);
  return u ? { userId: u.userId, id: u.id, name: u.name } : null;
}

async function getByIdWithPassword(id) {
  const u = users.get(id);
  return u ? { ...u } : null; // password 포함
}

async function getByUserId(userId) {
  for (const u of users.values()) {
    if (u.userId === userId) return { userId: u.userId, id: u.id, name: u.name };
  }
  return null;
}

module.exports = {
  isIdTaken,
  create,
  getById,
  getByIdWithPassword,
  getByUserId,
};
