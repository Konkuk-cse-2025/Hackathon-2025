// src/server.js (상단)
const path = require('path');
if (!process.env.RAILWAY_ENVIRONMENT_NAME && process.env.NODE_ENV !== 'production') {
  require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
}

const express = require('express');
const cors = require('cors');
const app = express();
app.set('trust proxy', 1);

// ✅ CORS allowlist 정의
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

// ✅ Prisma 사용 시 mongoose.connect() 불필요
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server on ${PORT}`));
