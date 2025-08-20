const router = require('express').Router();
const c = require('../controllers/letter.controller');

router.post('/', c.create); // ← 깔끔
router.get('/mailboxes/:id/letters', c.listInMailbox);
router.get('/:id', c.getOne);

module.exports = router;
