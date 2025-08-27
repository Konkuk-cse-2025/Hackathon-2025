import axios from "axios";

function normalizeBase(base: string) {
  if (/^https?:\/\//.test(base)) return base.replace(/\/+$/, "");
  return `${window.location.origin}/${base.replace(/^\/+/, "")}`.replace(/\/+$/, "");
}
const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";
export const BASE = normalizeBase(API_BASE);

export const api = axios.create({
  baseURL: BASE,             // ✅ 모든 요청은 이 오리진으로
  withCredentials: true,     // ✅ 쿠키/자격증명 전역 허용 (개발 단계)
  headers: { "Content-Type": "application/json" },
});

// 요청마다 토큰 자동 첨부
api.interceptors.request.use((config) => {
  const raw = localStorage.getItem("token") || "";
  const token = raw.startsWith("Bearer ") ? raw.slice(7) : raw;

  // axios v1에서 headers가 옵셔널일 수 있음
  config.headers = config.headers ?? {};

  if (token) {
    (config.headers as any)["Authorization"] = `Bearer ${token}`;
  } else {
    // 토큰이 사라진 뒤 이전 값이 남지 않도록
    delete (config.headers as any)["Authorization"];
  }
  return config;
});
