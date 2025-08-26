// backend/src/routes/mailbox.route.js
const r = require('express').Router();
const c = require('../controllers/mailbox.controller');
const authGuard = require('../middlewares/authGuard');

// 🔎 GET /mailboxes 에서의 lat/lng/radius 검증은 컨트롤러에서 처리하도록 단순화
r.get('/', c.list);

// 🔐 편지함 생성: 토큰 필수, ownerId는 컨트롤러에서 req.user로 설정
r.post('/', authGuard, c.create);

r.post('/:id/gate', c.gate);

module.exports = r;
