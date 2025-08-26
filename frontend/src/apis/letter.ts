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

export async function getMailboxLetters({
  mailboxId,
  limit = 20,
  cursor = null,
}: GetMailboxLettersParams) {
  const qs = new URLSearchParams();
  qs.set("limit", String(limit));
  if (cursor) qs.set("cursor", cursor);

  const { data } = await api.get(
    `/mailboxes/${mailboxId}/letters?` + qs.toString()
  );

  const items: Letter[] = (data.items ?? []).map((it: any) => ({
    id: String(it.id),
    title: it.title,
    body: it.body,
    // 서버가 createdAt(ISO)로 준다고 가정 → YYYY-MM-DD만 사용
    date: (it.createdAt ?? "").slice(0, 10),
  }));

  return {
    items,
    nextCursor: data.nextCursor ?? null,
  } as { items: Letter[]; nextCursor: string | null };
}

export type CreateLetterPayload = {
  mailboxId: string; // 어떤 편지함에 쓰는지
  title: string;
  to?: string;
  from?: string;
  body: string;
};

// 명세: POST /letters  (헤더 Authorization: Bearer <JWT>)
export async function createLetter(payload: CreateLetterPayload) {
  const { data } = await api.post("/letters", payload);
  // 서버가 저장된 편지 객체를 반환한다고 가정
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