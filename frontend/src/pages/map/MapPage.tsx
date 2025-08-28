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
  hint?: string;
};

export default function MapPage() {
  const [selected, setSelected] = useState<string | null>(null);
  const [boxes, setBoxes] = useState<Letterbox[]>([]);
  const [myLat, setMyLat] = useState<number | null>(null);
  const [myLng, setMyLng] = useState<number | null>(null);
  const [verifiedPw, setVerifiedPw] = useState<string | null>(null);

  // ▶︎ 새로고침/에러 상태
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const navigate = useNavigate();

  const selectedBox = useMemo(
    () => boxes.find((b) => b.id === selected) ?? null,
    [boxes, selected]
  );

  // ▶︎ 공통: 근처 편지함 불러오기
  async function loadNearby(lat: number, lng: number, radius = 10000) {
    setLoading(true);
    setErrorMsg(null);
    try {
      const data = await fetchLetterboxes({ lat, lng, radius });
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
    } catch (e: any) {
      console.error(e);
      setErrorMsg("편지함을 불러오지 못했어요.");
    } finally {
      setLoading(false);
    }
  }

  // ▶︎ 최초 로드: 현재 위치 기반으로 불러오기 (실패 시 서울시청 fallback)
  useEffect(() => {
    (async () => {
      try {
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
        setMyLat(lat);
        setMyLng(lng);

        await loadNearby(lat, lng, 10000);
        const data = await fetchLetterboxes({ lat, lng, radius: 10000 });

        // 3) 서버 -> UI 매핑이 API 모듈에 있으면 그대로 set
        setBoxes(
          data.map((it: any) => ({
            id: String(it.id),
            name: it.name,
            ownerName: it.ownerName ?? it.owner?.name ?? "익명",
            lat: it.lat,
            lng: it.lng,
            isSecret: it.isSecret,
            hint: it.hint ?? it.passwordHint ?? "",
          }))
        );
      } catch (e) {
        console.error(e);
        const lat = 37.5665;
        const lng = 126.978;
        setMyLat(lat);
        setMyLng(lng);

        await loadNearby(lat, lng, 1000);

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
              hint: it.hint ?? it.passwordHint ?? "",
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
      setVerifiedPw(pw);
      return true; // { ok: true }
    } catch (err: any) {
      if (err.status === 409) {
        // 비번 불일치
        return false;
      }
      if (err.status === 401 || err.status === 403) {
        alert(" 100m 이내에서만 열 수 있어요.");
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
        alert(" 100m 이내에서만 열 수 있어요.");
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
          onSelect={handleSelect}
        />

        {selectedBox && (
          <Backdrop onClose={() => setSelected(null)}>
            {selectedBox.isSecret ? (
              <SecretBox
                boxName={selectedBox.name}
                ownerName={selectedBox.ownerName}

                hint={selectedBox.hint}
                onVerify={verifyPw} // ⬅ 비밀함은 여기서 서버검증
                onEnter={() => {
                  const pw = verifiedPw;
                  setVerifiedPw(null);
                  setSelected(null);
                  navigate(`/letter/${selectedBox!.id}`, {
                    state: { password: pw },
                  });
                }}
                onClose={() => {
                  setVerifiedPw(null);
                  setSelected(null);
                }}
              />
            ) : (
              <PublicBox
                boxName={selectedBox.name}
                ownerName={selectedBox.ownerName}
                onEnter={() => tryEnterPublic(selectedBox.id)}
                onClose={() => setSelected(null)}
              />
            )}
          </Backdrop>
        )}

        {/* ▶︎ 지도 위 카드 오버레이 */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h2 className={styles.cardTitle}>
              <img
                src="/icons/mailmail 2.png"
                alt=""
                aria-hidden="true"
                className={styles.icon}
              />
            </h2>

            <button
              className={styles.refreshBtn}
              onClick={() => {
                if (myLat == null || myLng == null) {
                  alert("현재 위치를 가져오지 못했어요.");
                  return;
                }
                loadNearby(myLat, myLng, 10000);
              }}
              disabled={loading}
              aria-label="근처 편지함 다시 불러오기"
            >
              {loading ? "불러오는 중..." : 
              <img
                src="/icons/retry 2.png"
                alt=""
                aria-hidden="true"
                className={styles.icon1}
              />}
            </button>
          </div>

          <div className={styles.cardBody}>
            {errorMsg && <p className={styles.errorText}>{errorMsg}</p>}
            {boxes.length === 0 && !loading && !errorMsg && (
              <p className={styles.emptyText}>주변에 편지함이 없어요.</p>
            )}

            {/* 리스트: 클릭 시 해당 마커 선택 */}
            <ul className={styles.list}>
              {boxes.map((b) => (
                <li key={b.id} className={styles.item}>
                  <button
                    type="button"
                    className={styles.letterButton}
                    onClick={() => setSelected(b.id)}
                    aria-label={`${b.name} 위치로 이동`}
                  >
                    <span className={styles.lbName}>{b.name}</span>
                    <span className={styles.lbMeta}>
                      {b.ownerName} · {b.isSecret ? "비밀함" : "공개함"}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* 기존 플로팅 CTA (그대로 둠) */}
        <div className={styles.ctaRight}>
          <div className={styles.actionsRight}>
            <NavLink to="/letterbox">
              <Button
                fullWidth={false}
                rightIcon={
                  <img src="/icons/letter_make.png" alt="" aria-hidden="true" />
                }
              />
            </NavLink>
          </div>
        </div>

        <BottomNav />
      </div>
    </div>
  );
}
