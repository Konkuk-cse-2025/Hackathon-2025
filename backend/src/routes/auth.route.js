const express = require('express');
const ctrl = require('../controllers/auth.controller');

const router = express.Router();

router.post('/signup', ctrl.signup);
router.post('/login', ctrl.login);
router.get('/me', require('../middlewares/authGuard'), ctrl.me);

module.exports = router;
