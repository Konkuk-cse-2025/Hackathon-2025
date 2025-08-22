// src/server.js
require('dotenv').config();

const express = require('express');
const cors = require('cors');
// const mongoose = require('mongoose'); // 지금 안 쓰면 주석

const app = express();              // ✅ app을 먼저 만든 다음
app.use(cors());                    // 공통 미들웨어
app.use(express.json());            // ✅ 여기서 json 파서

console.log('[server] mounting /auth');
try {
  const authRoutes = require('./routes/auth.route');
  app.use('/auth', authRoutes);
  console.log('[server] /auth mounted');
} catch (e) {
  console.warn('⚠️  /auth route not mounted:', e.message);
  console.warn(e.stack);
}

// 헬스체크
app.get('/', (_req, res) => res.send('OK'));

// 라우터 마운트
try {
  console.log('[server] mounting /auth');
  const authRoutes = require('./routes/auth.route'); // CommonJS
  app.use('/auth', authRoutes);
  console.log('[server] /auth mounted');
} catch (e) {
  console.warn('⚠️  /auth route not mounted:', e.message);
}

// 에러 핸들러 (라우터 아래)
app.use((err, req, res, next) => {
  const status = err.status || 500;
  if (process.env.NODE_ENV !== 'production') {
    console.error('[error]', err);
  }
  res.status(status).json({ message: err.message || 'Server error' });
});

const PORT = Number(process.env.PORT) || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
