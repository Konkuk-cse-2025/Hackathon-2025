// src/services/auth.service.js

// ⚠️ 경로/파일명 정확히! (확장자 명시)
const userRepo = require('../repositories/user.repo.js');
const hashUtil = require('../utils/hash.js');
const { validatePassword } = require('../utils/validate.js');
const { sign } = require('../utils/jwt.js');

/**
 * 회원가입
 * 입력: { id(로그인 아이디), name, password(평문) }
 * 반환: { user: { userId, id, name } }
 */
async function signup({ id, name, password }) {
  // 1) 필수 값 검증
  if (!id || !name || !password) {
    const e = new Error('id, name, password는 모두 입력해야 합니다.');
    e.status = 400;
    throw e;
  }

  // 2) 비밀번호 규칙 검증 (8자 이상 + 숫자 최소 1개)
  if (!validatePassword(password)) {
    const e = new Error('비밀번호는 8자 이상이어야 하고, 숫자를 최소 1개 포함해야 합니다.');
    e.status = 400;
    throw e;
  }

  // 3) 아이디 중복 확인
  const taken = await userRepo.isIdTaken(id);
  if (taken) {
    const e = new Error('이미 사용 중인 아이디입니다.');
    e.status = 409;
    throw e;
  }

  // 4) 비밀번호 해시 & 사용자 생성
  const passwordHash = await hashUtil.hash(password); // ← 네임스페이스로 호출
  const created = await userRepo.create({ id, name, passwordHash });

  // 5) 비밀번호는 절대 반환하지 않음
  return {
    user: {
      userId: created.userId,
      id: created.id,
      name: created.name,
    },
  };
}

/**
 * 로그인
 * 입력: { id(로그인 아이디), password }
 * 반환: { token, user: { id, name } }
 */
async function login({ id, password }) {
  // 1) 입력값 검증
  if (!id || !password) {
    const err = new Error('id와 password가 필요합니다.');
    err.status = 400;
    throw err;
  }

  // 2) 아이디로 조회(해시 포함)
  const user = await userRepo.getByIdWithPassword(id);

  // 3) 아이디/비번 불일치 → 동일 메시지 통일
  const ok = user && await hashUtil.compare(password, user.password);
  if (!ok) {
    const err = new Error('아이디 또는 비밀번호가 일치하지 않습니다.');
    err.status = 401;
    throw err;
  }

  // 4) JWT 발급: sub에는 내부 PK(userId)
  const token = sign({ sub: user.userId });

  // 5) 응답
  return {
    token,
    user: {
      id: user.id,
      name: user.name,
    },
  };
}

module.exports = { signup, login };
