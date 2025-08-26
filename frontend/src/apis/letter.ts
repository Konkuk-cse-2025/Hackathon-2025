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
export async function fetchIsSaved(letterId: number) {
  const { data } = await api.get(`/letters/${letterId}/isSaved`, { withCredentials: true });
  return data as { ok: boolean; saved: boolean; letterId: number };
}

export async function saveLetter(letterId: number) {
  const { data } = await api.post(`/letters/${letterId}/save`, null, { withCredentials: true });
  return data as { ok: boolean; saved: true; letterId: number };
}

export async function unsaveLetter(letterId: number) {
  const { data } = await api.delete(`/letters/${letterId}/save`, { withCredentials: true });
  return data as { ok: boolean; saved: false; letterId: number; removed: number };
}

export async function fetchMySavedLetters() {
  const { data } = await api.get(`/users/me/saved-letters`, { withCredentials: true });
  return data as { ok: boolean; items: any[] };

}
export async function getBookmarkState(letterId: string | number) {
  const { data } = await api.get(`/letters/${letterId}/bookmark`, {
    withCredentials: true,
  });
  return { saved: !!data?.saved };
}

export async function bookmarkLetter(letterId: string | number) {
  const { data } = await api.post(
    `/letters/${letterId}/bookmark`,
    null,
    { withCredentials: true }
  );
  // { ok, message, savedLetterId } 예상
  return { ok: !!data?.ok, saved: true, savedLetterId: data?.savedLetterId };
}

export async function unbookmarkLetter(letterId: string | number) {
  await api.delete(`/letters/${letterId}/bookmark`, {
    withCredentials: true,
  });
  return { ok: true, saved: false };
}

/** 편의 토글 헬퍼 (현재 상태 받아서 분기) */
export async function toggleBookmark(letterId: string | number, currentSaved: boolean) {
  if (currentSaved) {
    return unbookmarkLetter(letterId);
  }
  return bookmarkLetter(letterId);
}