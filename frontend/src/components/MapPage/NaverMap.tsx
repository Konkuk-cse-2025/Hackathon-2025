import React, { useEffect, useRef, useState } from "react";
type NMap = any;

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

const NaverMap: React.FC = () => {
  const mapDivRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<NMap | null>(null);
  const meMarkerRef = useRef<NMap | null>(null);
  const watchIdRef = useRef<number | null>(null);

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
          },
          (err) => console.warn("getCurrentPosition error:", err),
          { enableHighAccuracy: true, timeout: 10000 }
        );

        watchIdRef.current = navigator.geolocation.watchPosition(
          (pos) => {
            if (!mounted) return;
            const here = new naver.maps.LatLng(
              pos.coords.latitude,
              pos.coords.longitude
            );
            meMarkerRef.current?.setPosition(here);
            if (followRef.current) mapRef.current?.panTo(here);
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
      <div ref={mapDivRef} style={{ width: "100%", flex: 1 }} />
    </div>
  );
};

export default NaverMap;
