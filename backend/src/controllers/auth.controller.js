const svc = require('../services/auth.service');

async function signup(req, res, next) {
  try {
    const { id, name, password } = req.body;           // ← 반드시 password 포함
    const result = await svc.signup({ id, name, password });
    return res.status(201).json({ ...result, message: '회원가입 성공' });
  } catch (e) { next(e); }
}

async function login(req, res, next) {
  try {
    const { id, password } = req.body;
    const result = await svc.login({ id, password });
    return res.json({ ...result, message: '로그인 성공' });
  } catch (e) { next(e); }
}

async function me(req, res, next) {
  try {
    const user = await svc.getMyProfile(req.userId);
    return res.json({ user });
  } catch (e) { next(e); }
}

module.exports = { signup, login, me };
