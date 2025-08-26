import { api } from "./apiClient";

export type Letter = {
  id: string;
  title: string;
  body: string;
  date: string; // ISO "YYYY-MM-DD"
};

export type GetMailboxLettersParams = {
  mailboxId: string;
  limit?: number;
  cursor?: string | null;
};

async function tryGet(path: string, params: any) {
  try {
    const { data } = await api.get(path, { params });
    return data;
  } catch (e: any) {
    if (e?.response?.status === 404) return null; // 다음 후보 경로 시도
    throw e; // 401/500 등은 그대로 던짐
  }
}

export async function getMailboxLetters({
  mailboxId,
  limit = 20,
  cursor = null,
}: GetMailboxLettersParams) {
  const id = encodeURIComponent(mailboxId);

  const pos = await new Promise<GeolocationPosition>((resolve, reject) =>
    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 3000,
    })
  );

  const lat = pos.coords.latitude.toFixed(6);
  const lng = pos.coords.longitude.toFixed(6);

  const params: any = { lat, lng, limit };
  if (cursor) params.cursor = cursor;

  const { data } = await api.get(`/mailboxes/${mailboxId}/letters`, { params });

  const items: Letter[] = (data.items ?? []).map((it: any) => ({
    id: String(it.id),
    title: it.title ?? (it.content ? it.content.split("\n")[0] : "무제"),
    body: it.content ?? "",
    date: (it.createdAt ?? "").slice(0, 10),
  }));

  return {
    items,
    nextCursor: data.nextCursor ?? null,
  };
}

export type CreateLetterPayload = {
  mailboxId: string; // 어떤 편지함에 쓰는지
  title: string;
  to?: string;
  from?: string;
  body: string;
  lat: number;
  lng: number;
};

// 명세: POST /letters  (헤더 Authorization: Bearer <JWT>)
export async function createLetter(payload: CreateLetterPayload) {
  const pos = await new Promise<GeolocationPosition>((resolve, reject) =>
    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 3000,
    })
  );

  const lat = pos.coords.latitude.toFixed(6);
  const lng = pos.coords.longitude.toFixed(6);

  const req = {
    mailboxId: payload.mailboxId,
    title: payload.title,
    content: payload.body, // 서버는 content를 기대
    lat,
    lng,
    ...(payload.title ? { title: payload.title } : {}),
    ...(payload.to ? { to: payload.to } : {}),
    ...(payload.from ? { from: payload.from } : {}),
  };
  const { data } = await api.post("/letters", req);
  return data;
}
