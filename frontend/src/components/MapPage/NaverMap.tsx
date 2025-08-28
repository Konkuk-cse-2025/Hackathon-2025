import React, { useEffect, useRef, useState } from "react";
import LetterboxMarker from "./markers/LetterboxMarker";
import type { Letterbox } from "./types";
import styles from "./NaverMap.module.css";

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

  const lastPosRef = useRef<{ lat: number; lng: number; t: number } | null>(null);

  // ✅ 스무딩 버퍼는 ref로 (리렌더에도 유지)
  const smoothBufRef = useRef<Array<{ lat: number; lng: number }>>([]);
  function smoothPush(p: { lat: number; lng: number }) {
    const buf = smoothBufRef.current;
    buf.push(p);
    if (buf.length > 5) buf.shift(); // 최근 5개만
  }
  function smoothAverage() {
    const buf = smoothBufRef.current;
    if (buf.length === 0) {
      const last = lastPosRef.current ?? { lat: 0, lng: 0 };
      return { lat: last.lat, lng: last.lng };
    }
    const s = buf.reduce(
      (a, b) => ({ lat: a.lat + b.lat, lng: a.lng + b.lng }),
      { lat: 0, lng: 0 }
    );
    return { lat: s.lat / buf.length, lng: s.lng / buf.length };
  }

  const [follow, setFollow] = useState(true);
  const followRef = useRef(follow);
  followRef.current = follow;

  // 최초 1회 bounds fit 했는지 추적
  const didFitRef = useRef(false);

  useEffect(() => {
    let mounted = true;

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

      // === 현재 위치 ===
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
          { enableHighAccuracy: true, timeout: 30000 }
        );

        watchIdRef.current = navigator.geolocation.watchPosition(
          (pos) => {
            if (!mounted) return;

            const { latitude, longitude, accuracy } = pos.coords;
            const timestamp = pos.timestamp;
            const here = new naver.maps.LatLng(latitude, longitude);

            // 정확도 필터(옵션): 필요시 켜기
            // if (accuracy && accuracy > 80) return;

            const prev = lastPosRef.current;
            if (prev) {
              const dt = (timestamp - prev.t) / 1000;
              const hasGeom = !!(naver.maps.geometry && naver.maps.geometry.spherical);
              if (hasGeom) {
                const dist = naver.maps.geometry.spherical.computeDistance(
                  new naver.maps.LatLng(prev.lat, prev.lng),
                  here
                );
                // 1초 내 60m 이상 이동은 점프 취급
                if (dt < 1 && dist > 60) return;
              }
            }

            // 스무딩
            smoothPush({ lat: latitude, lng: longitude });
            const avg = smoothAverage();
            const smoothLatLng = new naver.maps.LatLng(avg.lat, avg.lng);

            // 마커 갱신
            meMarkerRef.current?.setPosition(smoothLatLng);

            // 따라가기면 카메라 이동
            if (followRef.current) mapRef.current?.panTo(smoothLatLng);

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

      // 지도를 드래그/핀치하면 따라가기 해제(UX)
      const stopFollow = () => setFollow(false);
      const dragId = naver.maps.Event.addListener(map, "dragstart", stopFollow);
      const pinchId = naver.maps.Event.addListener(map, "pinchstart", stopFollow);

      // 창 크기 변경 시 지도 리사이즈 트리거
      const onResize = () => {
        if (!mapRef.current) return;
        naver.maps.Event.trigger(mapRef.current, "resize");
      };
      window.addEventListener("resize", onResize);

      // 클린업
      return () => {
        naver.maps.Event.removeListener(dragId);
        naver.maps.Event.removeListener(pinchId);
        window.removeEventListener("resize", onResize);
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

  // ✅ 선택된 편지함으로 panTo
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !selectedId) return;

    const naver = (window as any).naver;
    const target = letterboxes.find((b) => b.id === selectedId);
    if (!target || !naver?.maps) return;

    const latlng = new naver.maps.LatLng(target.lat, target.lng);
    map.panTo(latlng);
    // 필요하면 약간 확대
    // if (map.getZoom() < 16) map.setZoom(16, true);
  }, [selectedId, letterboxes]);

  // ✅ 초기에 편지함들 보이도록 fitBounds (한 번만)
  // ✅ 초기에 편지함들 보이도록 fitBounds (한 번만, isEmpty() 없이 안전하게)
    useEffect(() => {
      const map = mapRef.current;
      if (!map || didFitRef.current) return;

      const naver = (window as any).naver;
      if (!naver?.maps) return;

      const hasBoxes = Array.isArray(letterboxes) && letterboxes.length > 0;
      const hasMe = !!lastPosRef.current;

      // 아무 점도 없으면 스킵
      if (!hasBoxes && !hasMe) return;

      // 첫 점으로 bounds 초기화 (LatLngBounds에 isEmpty가 없으니 이렇게 시작)
      let firstLatLng: any = null;
      if (hasMe) {
        firstLatLng = new naver.maps.LatLng(lastPosRef.current!.lat, lastPosRef.current!.lng);
      } else {
        // hasBoxes가 true일 때만 들어옴
        firstLatLng = new naver.maps.LatLng(letterboxes[0].lat, letterboxes[0].lng);
      }

      const bounds = new naver.maps.LatLngBounds(firstLatLng, firstLatLng);

      // 편지함들 포함
      if (hasBoxes) {
        for (let i = 0; i < letterboxes.length; i++) {
          const b = letterboxes[i];
          bounds.extend(new naver.maps.LatLng(b.lat, b.lng));
        }
      }

      // 내 위치도 포함
      if (hasMe) {
        bounds.extend(new naver.maps.LatLng(lastPosRef.current!.lat, lastPosRef.current!.lng));
      }

      try {
        map.fitBounds(bounds);
        didFitRef.current = true;
      } catch (e) {
        // fitBounds가 실패하더라도 앱이 죽지 않게 방지
        console.warn("fitBounds failed:", e);
      }
    }, [letterboxes]);


  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column" }}>
      {/* 지도 위 컨트롤 오버레이 */}
      <div className={styles.overlay}>
        <button
          onClick={() => setFollow((v) => !v)}
          className={styles.iconBtn1}
          aria-pressed={follow}
          title={follow ? "따라가기 끄기" : "따라가기 켜기"}
        >
          {follow ? (
            <img src="icons/follow_off.png" alt="따라가기 끄기" className={styles.icon1} />
          ) : (
            <img src="icons/follow_on.png" alt="따라가기 켜기" className={styles.icon1} />
          )}
        </button>

        <button
          onClick={() => {
            const pos = meMarkerRef.current?.getPosition?.();
            if (pos && mapRef.current) {
              mapRef.current.panTo(pos);
              setFollow(true); // 내 위치로 이동 시 따라가기 복구 (UX)
            }
          }}
          className={styles.iconBtn}
          title="내 위치로 이동"
        >
          <img src="icons/myfind.png" alt="내 위치로 이동" className={styles.icon} />
        </button>
      </div>

      {/* 지도 DOM */}
      <div ref={mapDivRef} style={{ width: "100%", height: "100%", zIndex: 0 }} />

      {/* 편지함 마커들 */}
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
