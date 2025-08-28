// src/services/auth.service.js
const userRepo = require("../repositories/user.repo");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

function signToken(userId) {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET 미설정");
  }
  return jwt.sign({ sub: userId }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
}

async function signup({ loginId, name, password }) {
  console.log("[service → repo payload]", {
    loginId,
    name,
    hasPassword: typeof password === "string",
  });

  // 기본 검증
  if (
    !loginId ||
    !name ||
    typeof password !== "string" ||
    password.length === 0
  ) {
    const e = new Error("loginId, name, password는 필수입니다.");
    e.status = 400;
    throw e;
  }

  // ✅ 비밀번호 규칙: 8자 이상 & 영문 최소 1개 & 숫자 최소 1개
  const pwRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
  if (!pwRegex.test(password)) {
    const e = new Error("비밀번호는 8자 이상이며, 영문과 숫자를 최소 1개 이상 포함해야 합니다.");
    e.status = 400;
    throw e;
  }

  // 아이디 중복 확인
  const taken = await userRepo.isIdTaken(loginId);
  if (taken) {
    const e = new Error("이미 사용 중인 아이디입니다.");
    e.status = 409; // Conflict가 의미상 더 적절
    throw e;
  }

  // 비밀번호 해시
  const hash = await bcrypt.hash(password, 10);

  // 저장 (repo.create는 전달값 그대로 저장한다고 가정)
  const user = await userRepo.create({ loginId, name, password: hash });

  // ✅ 토큰 sub에는 user의 고유 식별자(id) 사용
  const token = signToken(user.id);

  return { token, user };
}

async function login({ loginId, password }) {
  if (!loginId || typeof password !== "string" || password.length === 0) {
    const e = new Error("loginId, password는 필수입니다.");
    e.status = 400;
    throw e;
  }

  const u = await userRepo.findByIdWithPassword(loginId);
  if (!u) {
    const e = new Error("존재하지 않는 아이디입니다.");
    e.status = 404;
    throw e;
  }

  const ok = await bcrypt.compare(password, u.password);
  if (!ok) {
    const e = new Error("비밀번호가 올바르지 않습니다.");
    e.status = 401;
    throw e;
  }

  const token = signToken(u.id);
  const user = { loginId: u.loginId, id: u.id, name: u.name };
  return { token, user };
}

async function getMyProfile(loginId) {
  // 함수명 그대로 유지 (Mongo 시절 네이밍이지만 Prisma에서도 userID로 조회)
  const user = await userRepo.findByUserObjectId(loginId);
  if (!user) {
    const e = new Error("사용자를 찾을 수 없습니다.");
    e.status = 404;
    throw e;
  }
  return user;
}

module.exports = { signup, login, getMyProfile };
