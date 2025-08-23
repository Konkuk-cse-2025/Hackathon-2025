import { useEffect, useRef } from "react";
import type { LatLng } from "../types";

type Props = {
  map: any; // naver.maps.Map
  position: { lat: number; lng: number };
  variant: "public" | "secret";
  selected?: boolean;
  onClick?: () => void;
};

const ICONS = {
  public: {
    url: "/icons/post_box_green.svg",
    size: [32, 40] as const,
    anchor: [16, 40] as const,
  },
  secret: {
    url: "/icons/post_box_red.svg",
    size: [32, 40] as const,
    anchor: [16, 40] as const,
  },
};

export default function LetterboxMarker({
  map,
  position,
  variant,
  selected,
  onClick,
}: Props) {
  const markerRef = useRef<any>(null);
  const listenerRef = useRef<any>(null);

  useEffect(() => {
    if (!map || !(window as any).naver?.maps) return;
    const { naver } = window as any;

    const icon = ICONS[variant];
    const marker = new naver.maps.Marker({
      position: new naver.maps.LatLng(position.lat, position.lng),
      map,
      icon: {
        url: icon.url,
        size: new naver.maps.Size(icon.size[0], icon.size[1]),
        anchor: new naver.maps.Point(icon.anchor[0], icon.anchor[1]),
      },
      zIndex: selected ? 200 : 100,
    });
    markerRef.current = marker;

    if (onClick) {
      listenerRef.current = naver.maps.Event.addListener(
        marker,
        "click",
        onClick
      );
    }

    return () => {
      if (listenerRef.current)
        naver.maps.Event.removeListener(listenerRef.current);
      marker.setMap(null);
    };
  }, [map]);

  // 위치/스타일 업데이트
  useEffect(() => {
    const m = markerRef.current;
    const { naver } = window as any;
    if (!m || !naver) return;

    m.setPosition(new naver.maps.LatLng(position.lat, position.lng));
    if (selected !== undefined) m.setZIndex(selected ? 200 : 100);

    const icon = ICONS[variant];
    m.setIcon({
      url: icon.url,
      size: new naver.maps.Size(icon.size[0], icon.size[1]),
      anchor: new naver.maps.Point(icon.anchor[0], icon.anchor[1]),
    });
  }, [position, variant, selected]);

  return null; // 실제 DOM 렌더링 없음 (네이버 마커는 지도 위에 그림)
}
