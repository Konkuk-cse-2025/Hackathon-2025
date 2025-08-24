const r = require('express').Router();
const c = require('../controllers/mailbox.controller');
const authGuard = require('../middlewares/authGuard');

r.get('/', c.list);
r.post('/', authGuard, c.create);           // ✅ 토큰 필수
r.post('/:id/gate', c.gate);

module.exports = r;
