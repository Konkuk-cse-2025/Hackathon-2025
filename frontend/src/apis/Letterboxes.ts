import { api } from "./apiClient";
import type { ServerLetterbox, UiLetterbox } from "@/types/letterbox";

const mapServerToUi = (it: ServerLetterbox): UiLetterbox => ({
  id: String(it.id),
  name: it.name,
  ownerName: it.owner?.name ?? "익명",
  lat: it.lat,
  lng: it.lng,
  isSecret: it.type === "SECRET",
  hint: (it as any).hint ?? (it as any).passwordHint ?? "",
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

// 위치를 매번 새로 받기(민감 액션이라 캐시 금지)
async function getFreshCoords(): Promise<{ lat: number; lng: number }> {
  const pos = await new Promise<GeolocationPosition>((resolve, reject) =>
    navigator.geolocation
      ? navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0, // ✅ 캐시된 위치 금지
        })
      : reject(new Error("Geolocation not supported"))
  );
  return {
    lat: +pos.coords.latitude.toFixed(6),
    lng: +pos.coords.longitude.toFixed(6),
  };
}

export async function createLetterbox(body: {
  name: string;
  isSecret: boolean;
  password?: string;
  passwordHint?: string;
  lat: number;  // 생성할 위치
  lng: number;
}): Promise<UiLetterbox> {
  // 비밀함 유효성
  if (body.isSecret && !body.password) {
    throw new Error("비밀 편지함은 비밀번호가 필요해요.");
  }

  // 민감 액션이므로 매번 최신 위치로 인증 좌표 확보
  const { lat: userLat, lng: userLng } = await getFreshCoords();

  const payload = {
    name: body.name,
    type: body.isSecret ? "SECRET" : "OPEN",
    lat: +body.lat.toFixed(6),
    lng: +body.lng.toFixed(6),
    // 서버 컨트롤러에서 기대: password / passwordHint, userLat / userLng
    ...(body.isSecret ? { password: body.password, passwordHint: body.passwordHint } : {}),
    userLat,
    userLng,
  };

  console.log("[createLetterbox] POST /mailboxes", payload);

  try {
    const { data } = await api.post<ServerLetterbox>("/mailboxes", payload);
    return mapServerToUi(data);
  } catch (e: any) {
    if (e?.response) {
      // 403이면 거리 초과, 400이면 파라미터 오류 등
      const status = e.response.status;
      const msg =
        status === 403
          ? "거리 초과: 100m 이내에서만 편지함을 만들 수 있어요."
          : e.response.data?.error || `요청 실패(${status})`;
      throw new Error(msg);
    }
    throw e;
  }
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
