const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema(
  {
    // 로그인 아이디
    id: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    // 사용자 이름
    name: {
      type: String,
      required: true,
      trim: true,
    },
    // 해시된 비밀번호 (기본 조회 시 제외)
    password: {
      type: String,
      required: true,
      select: false,
    },
  },
  { timestamps: true }
);

//
// ✅ 인스턴스 메서드 정의
//

/**
 * 비밀번호 해시 생성 메서드
 * - 사용자 생성(create) 시 평문 비밀번호를 해시해서 password 필드에 저장
 * @param {string} plain - 평문 비밀번호
 */
UserSchema.methods.setPassword = async function (plain) {
  const saltRounds = 10;
  this.password = await bcrypt.hash(plain, saltRounds);
};

/**
 * 비밀번호 검증 메서드
 * - 로그인 시 입력받은 평문 비밀번호와 DB에 저장된 해시 비교
 * @param {string} plain - 평문 비밀번호
 * @returns {Promise<boolean>}
 */
UserSchema.methods.verifyPassword = async function (plain) {
  return bcrypt.compare(plain, this.password);
};

//
// ✅ JSON 직렬화 시 비밀번호 제거
//
UserSchema.set('toJSON', {
  transform: (_doc, ret) => {
    delete ret.password;
    delete ret.__v;
    return ret;
  },
});

const User = mongoose.model('User', UserSchema, 'users');
module.exports = User;
