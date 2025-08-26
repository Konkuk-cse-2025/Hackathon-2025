// src/server.js
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });

const express = require("express");
const cors = require("cors");

const app = express();
console.log("DATABASE_URL =", process.env.DATABASE_URL);

// 공통 미들웨어
const corsOptions = {
  origin: "http://localhost:5173", // 클라이언트의 도메인
  credentials: true, // 자격 증명(쿠키, 인증 헤더 등)을 허용
};

app.use(cors(corsOptions));
//app.options('*', cors(corsOptions));

app.use(express.json());

// 헬스체크
app.get("/", (_req, res) => res.send("OK"));

// 라우터 마운트 (auth는 있으면 한 번만)
try {
  const authRoutes = require("./routes/auth.route");
  app.use("/auth", authRoutes);
  console.log("[server] /auth mounted");
} catch (e) {
  console.warn("⚠️  /auth route not mounted:", e.message);
}

// 반드시 mailboxes/letters 라우터 등록
const mailboxRoutes = require("./routes/mailbox.route");
const letterRoutes = require("./routes/letter.route");

app.use("/mailboxes", mailboxRoutes);
app.use("/letters", letterRoutes);

// 에러 핸들러 (라우터 아래)
app.use((err, req, res, next) => {
  const status = err.status || 500;
  if (process.env.NODE_ENV !== "production") {
    console.error("[error]", err);
  }
  res.status(status).json({ message: err.message || "Server error" });
});

// 404 핸들러 추가
app.use((req, res) => {
  res.status(404).json({ message: "Not Found" });
});

const PORT = Number(process.env.PORT) || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
