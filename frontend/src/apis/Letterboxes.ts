import { api } from "./apiClient";
import type { ServerLetterbox, UiLetterbox } from "@/types/letterbox";

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

  console.log("[fetchLetterboxes] GET /mailboxes", { lat, lng, radius });

  try {
    const { data } = await api.get<ServerLetterbox[]>("/mailboxes", {
      params: { lat, lng, radius }, // ✅ axios가 알아서 쿼리스트링 생성
    });
    return data.map(mapServerToUi);
  } catch (e: any) {
    if (e.response) {
      console.error("GET /mailboxes failed:", e.response.status, e.response.data);
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

  console.log("[createLetterbox] POST /mailboxes", payload);

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
    ...(params.password ? { password: params.password } : {}),
  };

  console.log("[canOpenLetterbox] POST", `/mailboxes/${params.boxId}/open`, payload);

  try {
    const { data } = await api.post<{ ok: boolean }>(`/mailboxes/${params.boxId}/open`, payload);
    return !!data?.ok;
  } catch (e: any) {
    if (e.response) {
      const err = new Error(`open failed: ${e.response.status}`);
      (err as any).status = e.response.status;
      (err as any).data = e.response.data;
      throw err;
    }
    throw e;
  }
}
