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
  const [boxes, setBoxes] = useState<Letterbox[]>([
    {
      id: "1",
      name: "공개함 A",
      ownerName: "정언",
      lat: 37.5669,
      lng: 126.9782,
      isSecret: false,
    },
    {
      id: "2",
      name: "비밀함 B",
      ownerName: "정언",
      lat: 37.5655,
      lng: 126.9775,
      isSecret: true,
    },
  ]);

  const selectedBox = useMemo(
    () => boxes.find((b) => b.id === selected) ?? null,
    [boxes, selected]
  );

  const navigate = useNavigate();
  useEffect(() => {
    (async () => {
      try {
        const data = await fetchLetterboxes();
        const mapped: Letterbox[] = data.map((it: any) => ({
          id: it.id,
          name: it.name,
          ownerName: it.ownerName ?? it.owner?.name ?? "익명", // ✅ 보정
          lat: it.lat,
          lng: it.lng,
          isSecret: it.isSecret,
        }));
        setBoxes(mapped);
      } catch (e) {
        console.error(e);
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
              ></Button>
            </NavLink>
          </div>
        </div>

        <BottomNav />
      </div>
    </div>
  );
}
