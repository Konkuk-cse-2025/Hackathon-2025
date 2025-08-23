// src/repositories/user.repo.js
const User = require('../models/User');

/**
 * 아이디(id)로 사용자 조회 (비밀번호 제외)
 * - auth.service.signup에서 중복 체크 용도로 사용
 * - 반환: Mongoose Document (id, name만 선택)
 */
async function findByIdField(id) {
  return User.findOne({ id }).select('id name');
}

/**
 * 아이디(id)로 사용자 조회 (비밀번호 포함)
 * - auth.service.login에서 비밀번호 검증을 위해 사용
 * - 반환: Mongoose Document (verifyPassword 인스턴스 메서드 사용해야 하므로 lean() 쓰지 않음)
 */
async function findByIdWithPassword(id) {
  return User.findOne({ id }).select('+password id name');
}

/**
 * 사용자 생성
 * - 평문 password를 받아서 모델 메서드로 해시 저장
 * - 반환: 저장된 Mongoose Document
 */
async function create({ id, name, password }) {
  const user = new User({ id, name });
  await user.setPassword(password); // 모델에 정의된 인스턴스 메서드
  return user.save();
}

/**
 * (선택) userId(ObjectId)로 조회 – 필요 시 사용
 * - 비밀번호 제외
 */
async function findByUserObjectId(userId) {
  return User.findById(userId).select('id name');
}

module.exports = {
  findByIdField,
  findByIdWithPassword,
  create,
  findByUserObjectId, // 선택 사용
};
