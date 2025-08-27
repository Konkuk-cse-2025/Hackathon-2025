import { api } from "./apiClient";

export type Letter = {
  mailboxId: string;
  id: string;
  title: string;
  body: string;
  date: string; // ISO "YYYY-MM-DD"
};

export type GetMailboxLettersParams = {
  mailboxId: string;
  limit?: number;
  cursor?: string | null;
  password?: string | null;
};

export async function getMailboxLetters({
  mailboxId,
  limit = 20,
  cursor = null,
  password = null,
}: GetMailboxLettersParams) {
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
  if (password) params.password = password;

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
  password?: string;
};

// 명세: POST /letters  (헤더 Authorization: Bearer <JWT>)
export async function createLetter(payload: CreateLetterPayload) {
  let lat = payload.lat?.toFixed?.(6);
  let lng = payload.lng?.toFixed?.(6);
  if (!lat || !lng) {
    const pos = await new Promise<GeolocationPosition>((resolve, reject) =>
      navigator.geolocation.getCurrentPosition(resolve, reject, {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 3000,
      })
    );
    lat = pos.coords.latitude.toFixed(6);
    lng = pos.coords.longitude.toFixed(6);
  }
  const req = {
    mailboxId: payload.mailboxId,
    title: payload.title,
    content: payload.body, // 서버는 content를 기대
    lat,
    lng,
    ...(payload.password ? { password: payload.password } : {}),
    ...(payload.to ? { to: payload.to } : {}),
    ...(payload.from ? { from: payload.from } : {}),
  };
  const { data } = await api.post("/letters", req);
  return data;
}


export async function getLetterById(
  letterId: number,
  { lat, lng }: { lat: string; lng: string }
) {
  const { data } = await api.get(`/letters/${letterId}`, {
    params: { lat, lng }, // 위치 정보 추가
    withCredentials: true,
  });
  return {
    id: String(data.id),
    title: data.title ?? (data.content ? data.content.split("\n")[0] : "무제"),
    body: data.body ?? data.content ?? "", // ✅ body 우선
    date: (data.date ?? data.createdAt ?? "").slice(0, 10), // ✅ createdAt 우선
    to: data.to ?? null,
    from: data.from ?? null,
  };
}

export async function getBookmarkState(letterId: number | string) {
  const { data } = await api.get(`/letters/${letterId}/bookmark`);
  return { saved: !!data?.saved };
}

export async function bookmarkLetter(letterId: number) {
  // POST /letters/:id/bookmark → { ok, saved: true, letterId, ... }
  const { data } = await api.post(
    `/letters/${letterId}/bookmark`,
    {},
    {
      withCredentials: true,
    }
  );
  return { ok: !!data?.ok, saved: true, letterId: data?.letterId };
}

export async function unbookmarkLetter(letterId: number) {
  // DELETE /letters/:id/bookmark → { ok, saved: false, letterId, ... }
  const { data } = await api.delete(`/letters/${letterId}/bookmark`, {
    withCredentials: true,
  });
  return { ok: !!data?.ok, saved: false, letterId: data?.letterId };
}



// 내가 쓴 편지: Letter[] 그대로 반환
export async function fetchMyLetters(): Promise<Letter[]> {
  const { data } = await api.get("/me/letters", { withCredentials: true });
  return (data.items ?? []).map((l: any) => ({
    id: String(l.id),
    title: l.title ?? (l.content ? String(l.content).split("\n")[0] : "무제"),
    body: l.body ?? l.content ?? "",
    date: String(l.createdAt ?? l.date ?? "").slice(0, 10),
  }));
}

// 저장한 편지: Letter[] 로 '가공'해서 반환
export async function fetchSavedLetters(): Promise<Letter[]> {
  const { data } = await api.get("/me/saved");
  return (data.items ?? []).map((it: any) => {
    const l = it.letter ?? it; // 혹시 평평하게 오는 경우도 커버
    return {
      id: String(l.id ?? ""), 
      title: l.title ?? (l.content ? String(l.content).split("\n")[0] : "무제"),
      body: l.body ?? l.content ?? "",                               // ✅ 본문
      date: String(l.createdAt ?? l.date ?? "").slice(0, 10),        // ✅ 날짜
    };
  });
}
