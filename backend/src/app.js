// backend/src/app.js
require('dotenv').config();

const express = require('express');
const cors = require('cors');

const mailboxRoutes = require('./routes/mailbox.route');

const app = express();

// 공통 미들웨어
app.use(cors());
app.use(express.json()); // ✅ JSON 바디 받기

// 라우트
app.use('/mailboxes', mailboxRoutes);

// 헬스체크
app.get('/', (_req, res) => res.send('OK'));

// 에러 핸들러
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(err.status || 500).json({ message: err.message || '서버 에러' });
});

module.exports = app;
