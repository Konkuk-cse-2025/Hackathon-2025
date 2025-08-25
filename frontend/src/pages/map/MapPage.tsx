import { useEffect, useState, useMemo } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { fetchLetterboxes } from "@/apis/Letterboxes";

import Header from "@/components/common/Header/Header";
import Button from "@/components/common/button/Button";
import NaverMap from "@/components/MapPage/NaverMap";
import styles from "./MapPage.module.css";
import BottomNav from "@/components/common/BottomNav/BottomNav";
import SecretBox from "@/components/MapPage/Popup/secretBox";
import PublicBox from "@/components/MapPage/Popup/publicBox";
import Backdrop from "@/components/common/Backdrop/Backdrop";

export type Letterbox = {
  id: string;
  name: string;
  ownerName: string;
  lat: number;
  lng: number;
  isSecret: boolean; // true=비밀, false=공개
};

export default function MapPage() {
  const [selected, setSelected] = useState<string | null>(null);
  const [boxes, setBoxes] = useState<Letterbox[]>([]);
  const navigate = useNavigate();

  const selectedBox = useMemo(
    () => boxes.find((b) => b.id === selected) ?? null,
    [boxes, selected]
  );

  useEffect(() => {
    (async () => {
      try {
        // 1) 브라우저에서 현재 위치 얻기
        const pos = await new Promise<GeolocationPosition>((resolve, reject) =>
          navigator.geolocation
            ? navigator.geolocation.getCurrentPosition(resolve, reject, {
                enableHighAccuracy: true,
                timeout: 15000,
                maximumAge: 3000,
              })
            : reject(new Error("Geolocation not supported"))
        );

        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;

        // 2) 위치와 반경을 쿼리로 전달 (반경은 예시 1000m)
        const data = await fetchLetterboxes({ lat, lng, radius: 1000 });

        // 3) 서버 -> UI 매핑이 API 모듈에 있으면 그대로 set
        setBoxes(
          data.map((it: any) => ({
            id: String(it.id),
            name: it.name,
            ownerName: it.ownerName ?? it.owner?.name ?? "익명",
            lat: it.lat,
            lng: it.lng,
            isSecret: it.isSecret,
          }))
        );
      } catch (e) {
        console.error(e);
        try {
          const fallback = await fetchLetterboxes({
            lat: 37.5665,
            lng: 126.978,
            radius: 1000,
          });
          setBoxes(
            fallback.map((it: any) => ({
              id: String(it.id),
              name: it.name,
              ownerName: it.ownerName ?? it.owner?.name ?? "익명",
              lat: it.lat,
              lng: it.lng,
              isSecret: it.isSecret,
            }))
          );
        } catch (e2) {
          console.error("fallback also failed", e2);
        }
      }
    })();
  }, []);

  async function verifyPw(pw: string) {
    // TODO: 실제 API 연동
    // return api.verifyBox(selectedBox!.id, pw);
    return pw === "1234"; // 임시
  }

  return (
    <div className={styles.page}>
      <Header title="지도" />
      <div className={styles.mapPlaceholder}>
        <NaverMap
          letterboxes={boxes}
          selectedId={selected}
          onSelect={(id) => setSelected(id)}
        />
        {selectedBox && (
          <Backdrop onClose={() => setSelected(null)}>
            {selectedBox.isSecret ? (
              <SecretBox
                boxName={selectedBox.name}
                ownerName={selectedBox.ownerName}
                onVerify={verifyPw}
                onEnter={() => {
                  setSelected(null);
                  navigate(`/boxes/${selectedBox.id}`);
                }}
                onClose={() => setSelected(null)}
              />
            ) : (
              <PublicBox
                boxName={selectedBox.name}
                ownerName={selectedBox.ownerName}
                onEnter={() => {
                  setSelected(null);
                  navigate(`/boxes/${selectedBox.id}`);
                }}
                onClose={() => setSelected(null)}
              />
            )}
          </Backdrop>
        )}
        <div className={styles.cta}>
          <div className={styles.actionsRight}>
            <NavLink to="/letterbox">
              <Button
                fullWidth={false}
                rightIcon={
                  <img src="/icons/letterbox.png" alt="" aria-hidden="true" />
                }
              />
            </NavLink>

            <NavLink to="/write">
              <Button>편지쓰기</Button>
            </NavLink>
          </div>
        </div>

        <BottomNav />
      </div>
    </div>
  );
}
