const path = require('path');
const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');

// .env 로드 (Railway 환경 제외)
if (!process.env.RAILWAY_ENVIRONMENT_NAME && process.env.NODE_ENV !== 'production') {
  require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
}

const app = express();
app.set('trust proxy', 1);


app.use(
  cors({
    origin: "http://localhost:5173", // 정확한 오리진
    credentials: true, // Allow-Credentials를 true로 설정
  })
);

const prisma = new PrismaClient();


// ====== CORS 설정 ======
const allowedOrigins = [
  "http://localhost:5173", // Vite dev
  "https://konkuk-hackathon-2025-qu2t.vercel.app", // 배포 프론트 도메인
  process.env.FRONT_ORIGIN, // env로 받은 origin
].filter(Boolean);

app.use(cors({
  origin: allowedOrigins,
  credentials: true, // Allow-Credentials
}));

// ====== 공통 미들웨어 ======
app.use(express.json()); // JSON Body 파싱
app.use(express.urlencoded({ extended: false })); // 폼 전송 파싱

// ====== 헬스체크 ======
app.get('/', (_req, res) => res.send('OK'));
app.get('/healthz', (_req, res) => res.json({ ok: true }));

// ====== 라우터 ======
try {
  const authRoutes = require('./routes/auth.route');
  app.use('/auth', authRoutes);
  console.log('[server] /auth mounted');
} catch (e) {
  console.warn('⚠️ /auth route not mounted:', e.message);
  console.warn(e.stack);
}

const mailboxRoutes = require('./routes/mailbox.route');
const letterRoutes = require('./routes/letter.route');
const meRoutes = require('./routes/me.route');

app.use('/mailboxes', mailboxRoutes);
app.use('/letters', letterRoutes);
app.use('/me', meRoutes);

// ====== 404 핸들러 ======
app.use((req, res, next) => {
  const err = new Error("Not Found");
  err.status = 404;
  next(err);
});

// ====== 공통 에러 핸들러 ======
app.use((err, req, res, _next) => {
  const status = err.status || 500;
  if (process.env.NODE_ENV !== "production") {
    console.error("[error]", err);
  }
  res.status(status).json({
    message: err.message || "Server error",
  });
});

// ====== 서버 시작 ======
const PORT = Number(process.env.PORT) || 3000;

async function start() {
  try {
    await prisma.$connect();
    console.log('[db] Prisma connected');

    app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
  } catch (e) {
    console.error('[startup] failed:', e);
    process.exit(1);
  }
}

// 정상 종료 처리
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
