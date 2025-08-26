// src/server.js
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });

const express = require("express");
const cors = require("cors");

const app = express();

app.use(
  cors({
    origin: "http://localhost:5173", // 정확한 오리진
    credentials: false, // Allow-Credentials
  })
);

//app.options('*', cors(corsOptions));

app.use(express.json());

// ====== 공통 미들웨어 ======
app.use(cors()); // 프론트 연동 시 필요
app.use(express.json()); // JSON Body 파싱
app.use(express.urlencoded({ extended: false })); // 폼 전송 파싱(선택)

// ====== 헬스체크 ======
app.get("/", (_req, res) => res.send("OK"));
app.get("/healthz", (_req, res) => res.json({ ok: true }));

// ====== 라우터 마운트 ======
try {
  const authRoutes = require("./routes/auth.route");
  app.use("/auth", authRoutes);
  console.log("[server] /auth mounted");
} catch (e) {
  console.warn("⚠️  /auth route not mounted:", e.message);
}

// mailboxes / letters 라우트는 반드시 존재해야 함
const mailboxRoutes = require("./routes/mailbox.route");
const letterRoutes = require("./routes/letter.route");

app.use("/mailboxes", mailboxRoutes); // 예: GET /mailboxes/:id
app.use("/letters", letterRoutes); // 예: POST /letters/:id/bookmark

// ====== 404 핸들러 (라우트 아래) ======
app.use((req, res, next) => {
  const err = new Error("Not Found");
  err.status = 404;
  next(err);
});

// ====== 공통 에러 핸들러 (맨 마지막) ======
app.use((err, req, res, _next) => {
  const status = err.status || 500;
  if (process.env.NODE_ENV !== "production") {
    console.error("[error]", err);
  }
  res.status(status).json({
    message: err.message || "Server error",
  });
});

// ====== 서버 시작 ======
const PORT = Number(process.env.PORT) || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
