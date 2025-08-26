const router = require('express').Router();
const c = require('../controllers/letter.controller');
const authGuard = require('../middlewares/authGuard');
const validateId = require('../middlewares/validateId'); // ID 검증 미들웨어 추가

router.post('/', authGuard, c.create);      // ✅ 토큰 필수
router.get('/mailboxes/:id/letters', validateId, c.listInMailbox); // ID 검증 미들웨어 적용
router.get('/:id', c.getOne);

module.exports = router;
