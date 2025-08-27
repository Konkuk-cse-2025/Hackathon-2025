require("dotenv").config();
const path = require("path");
const express = require("express");
const cors = require("cors");
const session = require("express-session");
const fs = require("fs");
const SQLiteStore = require("connect-sqlite3")(session);
const { PrismaClient } = require("@prisma/client");

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
  "http://localhost:4173",       // vite preview
  "http://127.0.0.1:4173",
  "https://konkuk-hackathon-2025-qu2t.vercel.app", // 배포 프론트
  process.env.FRONT_ORIGIN,
].filter(Boolean);

app.use(
  cors({
    origin: function (origin, cb) {
      // 개발 도중 curl/Postman 등 origin 없는 요청 허용
      if (!origin) return cb(null, true);
      if (allowedOrigins.includes(origin)) return cb(null, true);
      return cb(new Error("Not allowed by CORS: " + origin), false);
    },
    credentials: true, // ★ 쿠키 허용
  })
);

const sessionsDir = path.resolve(__dirname, "../.sessions");
try {
  fs.mkdirSync(sessionsDir, { recursive: true });
  // 권한이 너무 빡세면 다음 줄도 고려:
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
      dir: sessionsDir,            // ✅ 존재하는 경로
      db: "sessions.sqlite",
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
