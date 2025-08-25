const userRepo = require("../repositories/user.repo.js");
const authService = require("../services/auth.service.js");

exports.postSignup = async (req, res, next) => {
  try {
    const result = await authService.signup(req.body);
    return res.status(201).json(result);
  } catch (err) {
    next(err);
  }
};

exports.postLogin = async (req, res, next) => {
  try {
    const result = await authService.login(req.body);
    return res.json(result);
  } catch (err) {
    next(err);
  }
};

exports.me = async (req, res, next) => {
  try {
    // 더 이상 userRepo 조회 안 함
    return res.json({ user: req.user });
  } catch (err) {
    next(err);
  }
};

exports.postSignup = async (req, res, next) => {
  try {
    console.log("[signup] body:", req.body);
    const result = await authService.signup(req.body);
    return res.status(201).json(result);
  } catch (err) {
    next(err);
  }
};
