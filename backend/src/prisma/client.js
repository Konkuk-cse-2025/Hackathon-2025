require('dotenv').config();                 // ← 반드시 최상단
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
module.exports = prisma;
