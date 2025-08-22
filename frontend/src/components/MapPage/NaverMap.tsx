import React, { useEffect, useRef } from "react";
type NMap = any;
const NaverMap: React.FC = () => {
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const { naver } = window as any;
    if (!naver || !mapRef.current) return;

    // 기본 지도 생성
    const map = new naver.maps.Map(mapRef.current, {
      center: new naver.maps.LatLng(37.5665, 126.978), // 기본: 서울
      zoom: 14,
    });

    // === 여기서 브라우저 현재 위치 API 실행 ===
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          const here = new naver.maps.LatLng(lat, lng);

          // 지도 중심 이동
          map.setCenter(here);

          // 마커 추가
          new naver.maps.Marker({
            position: here,
            map,
          });
        },
        (err) => {
          console.error("위치 불러오기 실패:", err);
        }
      );
    }
  }, []);

  return <div ref={mapRef} style={{ width: "100%", height: "100%" }} />;
};

export default NaverMap;
