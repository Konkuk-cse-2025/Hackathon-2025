const router = require('express').Router();
const c = require('../controllers/letter.controller');
const authGuard = require('../middlewares/authGuard');

router.post('/', authGuard, c.create);      // ✅ 토큰 필수
router.get('/mailboxes/:id/letters', c.listInMailbox);
router.get('/:id', c.getOne);

module.exports = router;
