// src/app.js  (임시 최소 버전)
const express = require('express');
const app = express();

app.get('/', (_req, res) => res.send('OK'));

module.exports = app;   // ⚠️ 반드시 이 형태 (module.exports = app)
