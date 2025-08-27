// src/controllers/auth.controller.js
const svc = require("../services/auth.service");

async function signup(req, res, next) {
  try {
    const loginId = req.body.loginId ?? req.body.id;
    const { name, password } = req.body;
    if (
      !loginId ||
      !name ||
      typeof password !== "string" ||
      password.length === 0
    ) {
      const e = new Error("loginId, name, password는 필수입니다.");
      e.status = 400;
      throw e;
    }

    const result = await svc.signup({ loginId, name, password });
    return res.status(201).json({ ...result, message: "회원가입 성공" });
  } catch (e) {
    next(e);
  }
}

async function login(req, res, next) {
  try {
    const loginId = req.body.loginId ?? req.body.id;
    const { password } = req.body;
    if (!loginId || typeof password !== "string" || password.length === 0) {
      const e = new Error("loginId, password는 필수입니다.");
      e.status = 400;
      throw e;
    }
    const result = await svc.login({ loginId, password });
    return res.json({ ...result, message: "로그인 성공" });
  } catch (e) {
    next(e);
  }
}

async function me(req, res, next) {
  try {
    // 토큰 미들웨어가 어디에 넣어주든 대비:
    // - req.userId (네가 기존에 쓰던 키)
    // - req.user?.userID (payload 파싱해서 세팅했을 경우)
    // - req.auth?.userID (다른 미들웨어 컨벤션)
    const userID = req.userId || req.user?.userID || req.auth?.userID;
    if (!userID) {
      const e = new Error("인증 정보가 없습니다.");
      e.status = 401;
      throw e;
    }
    const user = await svc.getMyProfile(userID);
    return res.json({ user });
  } catch (e) {
    next(e);
  }
}

module.exports = { signup, login, me };
