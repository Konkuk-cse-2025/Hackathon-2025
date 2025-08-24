import { api } from "./apiClient";
import type { ServerLetterbox, UiLetterbox } from "@/types/letterbox";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "";

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
  radius?: number;
}): Promise<UiLetterbox[]> {
  const { data } = await api.get<ServerLetterbox[]>("/mailboxes", { params });
  return data.map(mapServerToUi);
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
    lat: body.lat,
    lng: body.lng,
    password: body.isSecret ? body.password : undefined,
    passwordHint: body.isSecret ? body.passwordHint : undefined,
  };
  const { data } = await api.post<ServerLetterbox>("/mailboxes", payload);
  return mapServerToUi(data);
}
