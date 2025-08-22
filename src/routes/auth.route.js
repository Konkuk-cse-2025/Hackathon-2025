const express = require('express');
const router = express.Router();

const authCtrl = require('../controllers/auth.controller');
const authGuard = require('../middlewares/authGuard');

router.post('/signup', authCtrl.postSignup);
router.post('/login', authCtrl.postLogin);

// 보호 라우트
router.get('/me', authGuard, authCtrl.me);

module.exports = router;
