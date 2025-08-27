const r = require("express").Router();
const c = require("../controllers/mailbox.controller");
const authGuard = require("../middlewares/authGuard");
const validateId = require("../middlewares/validateId"); // ID 검증 미들웨어 추가
const letterCtrl = require("../controllers/letter.controller");

r.get("/", c.list);
r.post("/", authGuard, c.create); // ✅ 토큰 필수
r.post("/:id/gate", validateId, c.gate); // ID 검증 미들웨어 적용
r.post("/:id/open", validateId, c.gate); // 클라이언트가 요청하는 경로 추가

r.get("/:id/letters", validateId, letterCtrl.listInMailbox);

module.exports = r;
