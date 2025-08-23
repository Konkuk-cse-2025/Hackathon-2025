// src/server.js
const path = require('path');
if (!process.env.RAILWAY_ENVIRONMENT_NAME && process.env.NODE_ENV !== 'production') {
  require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
}

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();
app.set('trust proxy', 1);

// body
app.use(express.json());

// CORS
const allowed = ['http://localhost:3000', process.env.FRONT_ORIGIN].filter(Boolean);
app.use(cors({ origin: allowed, credentials: true })); // 필요하면 credentials:true

// 헬스체크
app.get('/healthz', (_req, res) => res.status(200).json({ ok: true }));

// 라우트
app.use('/auth', require('./routes/auth.route.js'));

// 공통 에러 핸들러 (라우트 뒤에, 한번만)
const errorHandler = require('./middlewares/errorHandler.js');
console.log('[debug] typeof errorHandler =', typeof errorHandler);
console.log('[debug] resolved path =', require.resolve('./middlewares/errorHandler.js'));
app.use(errorHandler);

// DB 연결 후 리스닝
const mongoUri = process.env.MONGODB_URI || process.env.DATABASE_URL;
if (!mongoUri) {
  console.error('[env] Missing MONGODB_URI');
  process.exit(1);
}
(async () => {
  try {
    await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 30000 });
    console.log('✅ MongoDB connected');
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => console.log(`🚀 Server on ${PORT}`));
  } catch (e) {
    console.error('❌ MongoDB connect error:', e.message);
    process.exit(1);
  }
})();
