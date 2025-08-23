import React, { useEffect, useRef, useState } from "react";
import LetterboxMarker from "./markers/LetterboxMarker";
import type { Letterbox } from "./types";

type Props = {
  letterboxes: Letterbox[];
  selectedId?: string | null;
  onSelect?: (id: string) => void;
};

function waitForNaverMaps(): Promise<any> {
  return new Promise((resolve) => {
    // 이미 로드됐다면 즉시 resolve
    if ((window as any).naver?.maps) return resolve((window as any).naver);

    // 없으면 로드될 때까지 폴링 (100ms 간격)
    const timer = setInterval(() => {
      if ((window as any).naver?.maps) {
        clearInterval(timer);
        resolve((window as any).naver);
      }
    }, 100);
  });
}

const NaverMap: React.FC<Props> = ({ letterboxes, selectedId, onSelect }) => {
  const mapDivRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const meMarkerRef = useRef<any>(null);
  const watchIdRef = useRef<number | null>(null);

  const lastPosRef = useRef<{ lat: number; lng: number; t: number } | null>(
    null
  );

  const smoothBuf: Array<{ lat: number; lng: number }> = [];
  function smoothPush(p: { lat: number; lng: number }) {
    smoothBuf.push(p);
    if (smoothBuf.length > 5) smoothBuf.shift(); // 최근 5개만
  }
  function smoothAverage() {
    if (smoothBuf.length === 0) return lastPosRef.current ?? { lat: 0, lng: 0 };
    const s = smoothBuf.reduce(
      (a, b) => ({ lat: a.lat + b.lat, lng: a.lng + b.lng }),
      { lat: 0, lng: 0 }
    );
    return { lat: s.lat / smoothBuf.length, lng: s.lng / smoothBuf.length };
  }

  const [follow, setFollow] = useState(true);
  const followRef = useRef(follow);
  followRef.current = follow;

  useEffect(() => {
    let mounted = true;

    // ✅ async IIFE로 감싸서 await 사용
    (async () => {
      const naver = await waitForNaverMaps();
      if (!mounted || !mapDivRef.current) return;

      const map = new naver.maps.Map(mapDivRef.current, {
        center: new naver.maps.LatLng(37.5665, 126.978),
        zoom: 14,
      });
      mapRef.current = map;

      meMarkerRef.current = new naver.maps.Marker({
        position: map.getCenter(),
        map,
      });

      // === 여기서 브라우저 현재 위치 API 실행 ===
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            if (!mounted) return;
            const here = new naver.maps.LatLng(
              pos.coords.latitude,
              pos.coords.longitude
            );
            map.setCenter(here);
            meMarkerRef.current?.setPosition(here);
            lastPosRef.current = {
              lat: pos.coords.latitude,
              lng: pos.coords.longitude,
              t: pos.timestamp,
            };
          },
          (err) => console.warn("getCurrentPosition error:", err),
          { enableHighAccuracy: true, timeout: 10000 }
        );

        watchIdRef.current = navigator.geolocation.watchPosition(
          (pos) => {
            if (!mounted) return;

            const { latitude, longitude, accuracy } = pos.coords;
            const timestamp = pos.timestamp;
            const here = new naver.maps.LatLng(latitude, longitude);

            // 1) 정확도 필터: 80m 이상 오차는 무시
            if (accuracy && accuracy > 80) return;

            // 2) 점프 필터: 1초 내 60m 이상 이동은 무시
            const prev = lastPosRef.current;
            if (prev) {
              const dt = (timestamp - prev.t) / 1000;
              const dist = naver.maps.GeometryUtil.getDistance(
                new naver.maps.LatLng(prev.lat, prev.lng),
                here
              );
              if (dt < 1 && dist > 60) return;
            }

            // 3) 이동 평균(스무딩)
            smoothPush({ lat: latitude, lng: longitude });
            const avg = smoothAverage();
            const smoothLatLng = new naver.maps.LatLng(avg.lat, avg.lng);

            // 마커 갱신
            meMarkerRef.current?.setPosition(smoothLatLng);

            // 카메라 이동
            if (followRef.current) mapRef.current?.panTo(smoothLatLng);

            // 위치 기록
            lastPosRef.current = {
              lat: latitude,
              lng: longitude,
              t: timestamp,
            };
          },
          (err) => console.warn("watchPosition error:", err),
          { enableHighAccuracy: true, maximumAge: 3000, timeout: 10000 }
        );
      }
      // 5) 지도를 드래그/핀치하면 따라가기 해제(UX)
      const stopFollow = () => setFollow(false);
      const dragId = naver.maps.Event.addListener(map, "dragstart", stopFollow);
      const pinchId = naver.maps.Event.addListener(
        map,
        "pinchstart",
        stopFollow
      );

      // 클린업 등록
      return () => {
        naver.maps.Event.removeListener(dragId);
        naver.maps.Event.removeListener(pinchId);
      };
    })();

    return () => {
      mounted = false;
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
    };
  }, []);

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column" }}>
      <div style={{ padding: 8, display: "flex", gap: 8 }}>
        <button onClick={() => setFollow((v) => !v)}>
          {follow ? "따라가기 끄기" : "따라가기 켜기"}
        </button>
        <button
          onClick={() => {
            const pos = meMarkerRef.current?.getPosition?.();
            if (pos && mapRef.current) mapRef.current.panTo(pos);
          }}
        >
          내 위치로 이동
        </button>
      </div>
      <div
        ref={mapDivRef}
        style={{ width: "100%", height: "100%", zIndex: 0 }}
      />
      {mapRef.current &&
        letterboxes.map((b) => (
          <LetterboxMarker
            key={b.id}
            map={mapRef.current}
            position={{ lat: b.lat, lng: b.lng }}
            variant={b.isSecret ? "secret" : "public"} // 비밀/공개에 따라 디자인 분기
            selected={selectedId === b.id}
            onClick={() => onSelect?.(b.id)}
          />
        ))}
    </div>
  );
};

export default NaverMap;
