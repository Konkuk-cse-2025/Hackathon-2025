import { api } from "./apiClient";

export interface AuthUser {
  userId: string;
  id: string;
  name: string;
}

export interface AuthResponse {
  user: AuthUser;
  token: string;
}

// 회원가입
export function signup(data: { id: string; name: string; password: string }) {
  return api.post<AuthResponse>("/auth/signup", data).then((res) => res.data);
}

// 로그인
export function login(data: { id: string; password: string }) {
  return api.post<AuthResponse>("/auth/login", data).then((res) => res.data);
}

// 내 정보 조회 (보호 라우트)
export function fetchMe() {
  return api.get<{ user: AuthUser }>("/auth/me").then((res) => res.data);
}
