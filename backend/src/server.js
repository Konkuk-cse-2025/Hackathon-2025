// backend/src/server.js
require("dotenv").config();
const path = require("path");
const express = require("express");
const cors = require("cors");
const session = require("express-session");
const fs = require("fs");
const SQLiteStore = require("connect-sqlite3")(session);
const { PrismaClient } = require("@prisma/client");

// 로컬 개발 시 .env 경로 보조 로드
if (
  !process.env.RAILWAY_ENVIRONMENT_NAME &&
  process.env.NODE_ENV !== "production"
) {
  require("dotenv").config({ path: path.resolve(__dirname, "../.env") });
}

const app = express();
app.set("trust proxy", 1); // 프록시 뒤 HTTPS일 때 secure 쿠키 지원

const prisma = new PrismaClient();

/* ====== CORS (한 번만) ====== */
const allowedOrigins = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "http://localhost:4173", // vite preview
  "http://127.0.0.1:4173",
  "https://konkuk-hackathon-2025-qu2t.vercel.app", // 배포 프론트
  process.env.FRONT_ORIGIN, // 환경변수로 주입 가능
].filter(Boolean);

const corsOptions = {
  origin(origin, cb) {
    // 개발 중 curl/Postman 등 Origin 없는 요청 허용
    if (!origin) return cb(null, true);
    if (allowedOrigins.includes(origin)) return cb(null, true);
    return cb(new Error("Not allowed by CORS: " + origin), false);
  },
  credentials: true, // 쿠키/인증정보 허용
  methods: ["GET", "POST", "DELETE", "PUT", "PATCH", "OPTIONS"], // ✅ DELETE 포함
  allowedHeaders: ["Content-Type", "Authorization"],             // ✅ Bearer 토큰 허용
  preflightContinue: false,
  optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));
// ✅ Express 5에서는 "*" 와일드카드 문자열이 오류 → 정규식으로 전체 경로 매칭
app.options(/.*/, cors(corsOptions));

/* ====== 세션 디렉토리 ====== */
const sessionsDir = process.env.SESSION_DIR
  ? process.env.SESSION_DIR
  : path.resolve(__dirname, "../.sessions");

try {
  fs.mkdirSync(sessionsDir, { recursive: true });
  // 권한 문제가 있으면 아래 줄 해제 고려:
  // fs.chmodSync(sessionsDir, 0o700);
} catch (e) {
  console.error("❌ 세션 디렉토리 생성 실패:", e);
}

/* ====== 세션 미들웨어 ====== */
app.use(
  session({
    name: "sid",
    secret: process.env.SESSION_SECRET || "dev-secret",
    resave: false,
    saveUninitialized: false,
    store: new SQLiteStore({
      dir: sessionsDir,
      db: process.env.SESSION_DB || "sessions.sqlite",
    }),
    cookie: {
      httpOnly: true,
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    },
  })
);

/* ====== 공통 미들웨어 ====== */
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

/* ====== 헬스체크 ====== */
app.get("/", (_req, res) => res.send("OK"));
app.get("/healthz", (_req, res) => res.json({ ok: true }));

/* ====== 라우터 ====== */
try {
  const authRoutes = require("./routes/auth.route");
  app.use("/auth", authRoutes);
  console.log("[server] /auth mounted");
} catch (e) {
  console.warn("⚠️ /auth route not mounted:", e.message);
}

const mailboxRoutes = require("./routes/mailbox.route");
const letterRoutes = require("./routes/letter.route");
const meRoutes = require("./routes/me.route");

app.use("/mailboxes", mailboxRoutes);
app.use("/letters", letterRoutes);
app.use("/me", meRoutes);

/* ====== 404 핸들러 ====== */
app.use((req, res, next) => {
  const err = new Error("Not Found");
  err.status = 404;
  next(err);
});

/* ====== 공통 에러 핸들러 ====== */
app.use((err, req, res, _next) => {
  const status = err.status || 500;
  if (process.env.NODE_ENV !== "production") {
    console.error("[error]", err);
  }
  res.status(status).json({
    message: err.message || "Server error",
  });
});

/* ====== 서버 시작 ====== */
const PORT = Number(process.env.PORT) || 3000;

async function start() {
  try {
    await prisma.$connect();
    console.log("[db] Prisma connected");

    app.listen(PORT, () =>
      console.log(`🚀 Server running on http://localhost:${PORT}`)
    );
  } catch (e) {
    console.error("[startup] failed:", e);
    process.exit(1);
  }
}

process.on("SIGINT", async () => {
  try {
    await prisma.$disconnect();
  } finally {
    process.exit(0);
  }
});
process.on("SIGTERM", async () => {
  try {
    await prisma.$disconnect();
  } finally {
    process.exit(0);
  }
});

start();
