import axios from "axios";

export const api = axios.create({ baseURL: import.meta.env.VITE_API_BASE_URL });

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
