// src/routes/me.route.js
const express = require('express');
const router = express.Router();

const meCtrl = require('../controllers/me.controller');
const authGuard = require('../middlewares/authGuard'); // JWT → req.userId

// 마이페이지 진입 시: 버튼 숫자만 필요
router.get('/summary', authGuard, meCtrl.summary);

// 버튼 클릭 시 목록 조회
router.get('/letters', authGuard, meCtrl.getMyLetters);
router.get('/saved',  authGuard, meCtrl.getSavedLetters);

module.exports = router;
