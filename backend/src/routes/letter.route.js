
// src/routes/letter.route.js
const express = require('express');
const router = express.Router();

// 프로젝트 구조에 맞게 경로 확인!
const authGuard = require('../middlewares/authGuard');
const controller = require('../controllers/letter.controller');

// (필요 시) 편지 생성/조회
router.post('/', authGuard, controller.create); // POST /letters
router.get('/:id', controller.getOne);          // GET  /letters/:id
// listInMailbox가 다른 라우터(예: /mailboxes/:id/letters)에 있다면 생략해도 됨

// ✅ 북마크 추가/삭제 (server.js에서 '/letters'로 마운트됨)
router.post('/:id/bookmark', authGuard, controller.bookmark);    // POST   /letters/:id/bookmark
router.delete('/:id/bookmark', authGuard, controller.unbookmark); // DELETE /letters/:id/bookmark
router.get('/:id/bookmark', authGuard, controller.isBookmarked);

module.exports = router;
