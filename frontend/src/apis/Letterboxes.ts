import axios from "axios";
import { api } from "./apiClient";
import type { ServerLetterbox, UiLetterbox } from "@/types/letterbox";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

function normalizeBase(base: string) {
  if (/^https?:\/\//.test(base)) return base.replace(/\/+$/, "");
  // '/api' 혹은 ':3000' 같은 값이 들어오면 현재 origin을 붙여줌
  return `${window.location.origin}/${base.replace(/^\/+/, "")}`.replace(
    /\/+$/,
    ""
  );
}
const BASE = normalizeBase(API_BASE);

const mapServerToUi = (it: ServerLetterbox): UiLetterbox => ({
  id: String(it.id),
  name: it.name,
  ownerName: it.owner?.name ?? "익명",
  lat: it.lat,
  lng: it.lng,
  isSecret: it.type === "SECRET",
});

export async function fetchLetterboxes(params: {
  lat: number;
  lng: number;
  radius: number;
}): Promise<UiLetterbox[]> {
  const lat = +params.lat.toFixed(6);
  const lng = +params.lng.toFixed(6);
  const radius = Math.max(0, Math.floor(params.radius));

  const qs = new URLSearchParams({
    lat: String(lat),
    lng: String(lng),
    radius: String(radius),
  });

  const url = `${BASE}/mailboxes?${qs.toString()}`;
  console.log("[fetchLetterboxes] GET", url);

  try {
    const { data } = await api.get<ServerLetterbox[]>(url);
    return data.map(mapServerToUi);
  } catch (e: any) {
    if (e.response) {
      console.error(
        "GET /mailboxes failed:",
        e.response.status,
        e.response.data
      );
    } else {
      console.error("GET /mailboxes error:", e.message);
    }
    throw e;
  }
}

export async function createLetterbox(body: {
  name: string;
  isSecret: boolean;
  password?: string;
  passwordHint?: string;
  lat: number;
  lng: number;
}): Promise<UiLetterbox> {
  const payload = {
    name: body.name,
    type: body.isSecret ? "SECRET" : "OPEN",
    lat: +body.lat.toFixed(6),
    lng: +body.lng.toFixed(6),
    password: body.isSecret ? body.password : undefined,
    passwordHint: body.isSecret ? body.passwordHint : undefined,
  };

  const url = `${BASE}/mailboxes`;
  console.log("[createLetterbox] POST", url, payload);

  const { data } = await api.post<ServerLetterbox>("/mailboxes", payload);
  return mapServerToUi(data);
}
export async function canOpenLetterbox(params: {
  boxId: string;
  lat: number;
  lng: number;
  password?: string;
}): Promise<boolean> {
  const payload: { lat: number; lng: number; password?: string } = {
    lat: +params.lat.toFixed(6),
    lng: +params.lng.toFixed(6),
  };
  if (params.password) payload.password = params.password;

  try {
    // createLetterbox와 동일하게 api 인스턴스의 baseURL을 사용 (상대경로)
    const { data } = await api.post<{ ok: boolean }>(
      `/mailboxes/${params.boxId}/open`,
      payload,
      { withCredentials: true } // 서버가 세션/쿠키를 내려줄 수 있으므로
    );
    return !!data?.ok; // { ok: true } 기대
  } catch (e: any) {
    if (e.response) {
      // 상태코드(401/403/409/400 등)를 상위에서 분기할 수 있게 보존
      const err = new Error(`open failed: ${e.response.status}`);
      (err as any).status = e.response.status;
      (err as any).data = e.response.data;
      throw err;
    }
    throw e;
  }
}
