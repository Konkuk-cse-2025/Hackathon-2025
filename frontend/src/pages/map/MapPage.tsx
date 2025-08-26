import { useEffect, useState, useMemo } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { fetchLetterboxes, canOpenLetterbox } from "@/apis/Letterboxes";
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
  const [myLat, setMyLat] = useState<number | null>(null);   // ⬅ 추가
  const [myLng, setMyLng] = useState<number | null>(null);
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
        setMyLat(lat);                     // ⬅ 저장
        setMyLng(lng); 
        // 2) 위치와 반경을 쿼리로 전달 (반경은 예시 1000m)
        const data = await fetchLetterboxes({ lat, lng, radius: 100000 });

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
        const lat = 37.5665;
        const lng = 126.978;
        setMyLat(lat);                     // ⬅ 저장
        setMyLng(lng);
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

  function handleSelect(id: string) {
    setSelected(id);
  }

  async function verifyPw(pw: string) {
    if (!selectedBox || myLat == null || myLng == null) return false;
    try {
      await canOpenLetterbox({
        boxId: selectedBox.id,
        lat: myLat,
        lng: myLng,
        password: pw,
      });
      return true; // { ok: true }
    } catch (err: any) {
      if (err.status === 409) {
        // 비번 불일치
        return false;
      }
      if (err.status === 401 || err.status === 403) {
        alert("100m 이내에서만 열 수 있어요.");
        return false;
      }
      alert("열람 검증 중 문제가 발생했어요.");
      return false;
    }
  }
  async function tryEnterPublic(boxId: string) {
    if (myLat == null || myLng == null) {
      alert("현재 위치를 가져오지 못했어요.");
      return;
    }
    try {
      await canOpenLetterbox({ boxId, lat: myLat, lng: myLng });
      // 통과 시 이동
      setSelected(null);
      navigate(`/letter/${boxId}`);
    } catch (err: any) {
      if (err.status === 401 || err.status === 403) {
        alert("100m 이내에서만 열 수 있어요.");
      } else {
        alert("열람 검증 중 문제가 발생했어요.");
      }
    }
  }

  return (
    <div className={styles.page}>
      <Header
        mode="imageOnly"
        imageSrc="/icons/Logo_write.png"
        alt="편지함"
        imageWidth={80}
      />
      <div className={styles.mapPlaceholder}>
        <NaverMap
          letterboxes={boxes}
          selectedId={selected}
          onSelect={handleSelect}  // ⬅ 변경
        />

        {selectedBox && (
          <Backdrop onClose={() => setSelected(null)}>
            {selectedBox.isSecret ? (
              <SecretBox
                boxName={selectedBox.name}
                ownerName={selectedBox.ownerName}
                onVerify={verifyPw}                 // ⬅ 비밀함은 여기서 서버검증
                onEnter={() => {
                  // verifyPw에서 true 받은 후 호출됨
                  setSelected(null);
                  navigate(`/letter/${selectedBox.id}`); // ⬅ /letter/:id 로 이동
                }}
                onClose={() => setSelected(null)}
              />
            ) : (
              <PublicBox
                boxName={selectedBox.name}
                ownerName={selectedBox.ownerName}
                onEnter={() => tryEnterPublic(selectedBox.id)} // ⬅ 공개함 거리검증
                onClose={() => setSelected(null)}
              />
            )}
          </Backdrop>
        )}

        <div className={styles.ctaRight}>
          <div className={styles.actionsRight}>
            <NavLink to="/letterbox">
              <Button
                fullWidth={false}
                rightIcon={<img src="/icons/letter_make.png" alt="" aria-hidden="true" />}
              />
            </NavLink>
          </div>
        </div>

        <BottomNav />
      </div>
    </div>
  );
}
