// src/server.js
require('dotenv').config();

const express = require('express');
const cors = require('cors');

const app = express();

// 공통 미들웨어
app.use(cors());
app.use(express.json());

// 헬스체크
app.get('/', (_req, res) => res.send('OK'));

// 라우터 마운트 (auth는 있으면 한 번만)
try {
  const authRoutes = require('./routes/auth.route');
  app.use('/auth', authRoutes);
  console.log('[server] /auth mounted');
} catch (e) {
  console.warn('⚠️  /auth route not mounted:', e.message);
}

// 반드시 mailboxes/letters 라우터 등록
const mailboxRoutes = require('./routes/mailbox.route');
const letterRoutes  = require('./routes/letter.route');

app.use('/mailboxes', mailboxRoutes);
app.use('/letters',  letterRoutes);

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
