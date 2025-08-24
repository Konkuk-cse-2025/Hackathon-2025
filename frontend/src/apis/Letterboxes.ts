import type { Letterbox as UiLetterbox } from "@/components/MapPage/types";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "";

function mapServerToUi(it: any): UiLetterbox {
  return {
    id: String(it.id),
    name: it.name,
    lat: it.lat,
    lng: it.lng,
    isSecret: it.type === "SECRET",
  };
}

export async function fetchLetterboxes(params?: {
  lat?: number;
  lng?: number;
  radius?: number; // m
}): Promise<UiLetterbox[]> {
  const q = new URLSearchParams(params as any).toString();
  const res = await fetch(`${API_BASE}/mailboxes${q ? `?${q}` : ""}`);
  if (!res.ok) throw new Error("목록 조회 실패");
  const data = await res.json();
  return Array.isArray(data) ? data.map(mapServerToUi) : [];
}

export async function createLetterbox(body: {
  name: string;
  isSecret: boolean;
  password?: string;
  passwordHint?: string;
  lat: number;
  lng: number;
}) {
  const payload = {
    name: body.name,
    type: body.isSecret ? "SECRET" : "OPEN",
    lat: body.lat,
    lng: body.lng,
    password: body.isSecret ? body.password : undefined,
    passwordHint: body.isSecret ? body.passwordHint : undefined,
  };

  const res = await fetch(`${API_BASE}/mailboxes`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `생성 실패 (status ${res.status})`);
  }
  const created = await res.json();
  return mapServerToUi(created);
}
