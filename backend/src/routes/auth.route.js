// src/routes/auth.route.js
const express = require('express');
const ctrl = require('../controllers/auth.controller.js');
const authGuard = require('../middlewares/authGuard.js');

const router = express.Router();

// 회원가입 / 로그인
router.post('/signup', ctrl.postSignup);
router.post('/login', ctrl.postLogin);

// 내 정보
router.get('/me', authGuard, ctrl.me);

module.exports = router;
