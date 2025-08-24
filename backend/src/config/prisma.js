// backend/src/config/prisma.js
// .env 로 환경변수 로드 (서버 런타임에서 필요)
require('dotenv').config();

const { PrismaClient } = require('@prisma/client');

// 전역에서 하나의 인스턴스만 사용
const prisma = new PrismaClient();

module.exports = prisma;
