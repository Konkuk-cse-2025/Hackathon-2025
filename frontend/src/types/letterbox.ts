// 서버 응답 타입
export type ServerLetterbox = {
  id: number;
  name: string;
  type: "OPEN" | "SECRET";
  lat: number;
  lng: number;
  createdAt?: string;
  owner?: { name?: string };
};

// UI에서 사용할 타입(지도/목록 전부 이걸로 통일)
export type UiLetterbox = {
  id: string;
  name: string;
  ownerName: string; // 항상 존재하도록 보정
  lat: number;
  lng: number;
  isSecret: boolean;
};
