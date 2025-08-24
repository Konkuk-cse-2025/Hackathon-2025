import type { Letterbox } from "@/components/MapPage/types";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "";

export async function fetchLetterboxes(params?: {
  lat?: number;
  lng?: number;
  radius?: number;
}): Promise<Letterbox[]> {
  const q = new URLSearchParams(params as any).toString();
  const res = await fetch(`${API_BASE}/mailboxes${q ? `?${q}` : ""}`);
  if (!res.ok) throw new Error("목록 조회 실패");
  return res.json();
}

export async function createLetterbox(body: {
  name: string;
  isSecret: boolean;
  password?: string;
  passwordHint?: string;
  lat: number;
  lng: number;
}): Promise<Letterbox> {
  const res = await fetch(`${API_BASE}/mailboxes`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error("생성 실패");
  return res.json();
}
