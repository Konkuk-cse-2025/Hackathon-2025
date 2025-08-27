// src/server.js (SQLite/Prisma 버전)
const path = require('path');
if (!process.env.RAILWAY_ENVIRONMENT_NAME && process.env.NODE_ENV !== 'production') {
  require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
}

const express = require('express');
const cors = require('cors');
const app = express();
app.set('trust proxy', 1);

// ✅ Prisma (SQL) 초기화
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// ✅ CORS allowlist 정의 (그대로)
const allowed = ['http://localhost:3000', process.env.FRONT_ORIGIN].filter(Boolean);
// 필요시 모든 도메인 허용(개발용): app.use(cors({ origin: true, credentials: true }));
app.use(cors({ origin: allowed, credentials: true }));

// body parser
app.use(express.json());

// 헬스체크
app.get('/', (_req, res) => res.send('OK'));
app.get('/healthz', (_req, res) => res.status(200).json({ ok: true }));

// 라우터
try {
  const authRoutes = require('./routes/auth.route');
  app.use('/auth', authRoutes);
  console.log('[server] /auth mounted');
} catch (e) {
  console.warn('⚠️  /auth route not mounted:', e.message);
  console.warn(e.stack); // ← 추가: 어디 파일/몇 번째 줄인지 바로 확인
}


const mailboxRoutes = require('./routes/mailbox.route');
const letterRoutes  = require('./routes/letter.route');
const meRoutes      = require('./routes/me.route');

app.use('/mailboxes', mailboxRoutes);
app.use('/letters',  letterRoutes);
app.use('/me',       meRoutes);

// 공통 에러 핸들러
const errorHandler = require('./middlewares/errorHandler');
app.use(errorHandler);

// ✅ 서버 시작 + Prisma 연결/종료 관리
const PORT = process.env.PORT || 3000;

async function start() {
  try {
    // SQLite 파일에 연결 (DATABASE_URL = "file:./dev.db")
    await prisma.$connect();
    console.log('[db] Prisma connected');

    app.listen(PORT, () => console.log(`🚀 Server on ${PORT}`));
  } catch (e) {
    console.error('[startup] failed:', e);
    process.exit(1);
  }
}

// 정상 종료 처리 (SIGINT/SIGTERM)
process.on('SIGINT', async () => {
  try {
    await prisma.$disconnect();
  } finally {
    process.exit(0);
  }
});
process.on('SIGTERM', async () => {
  try {
    await prisma.$disconnect();
  } finally {
    process.exit(0);
  }
});

start();
