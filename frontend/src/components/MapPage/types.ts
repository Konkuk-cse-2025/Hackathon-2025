export type LatLng = { lat: number; lng: number };

export type Letterbox = {
  id: string;
  name: string;
  lat: number;
  lng: number;
  isSecret: boolean; // true = 비밀, false = 공개
};
