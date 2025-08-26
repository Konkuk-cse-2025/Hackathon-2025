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
