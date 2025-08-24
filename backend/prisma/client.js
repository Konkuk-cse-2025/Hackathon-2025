// prisma/client.js
const { PrismaClient } = require('@prisma/client');

// PrismaClient는 앱 전역에서 1개만 쓰는 게 안전합니다.
const prisma = new PrismaClient();

module.exports = prisma;
