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
  lat: number;
  lng: number;
  isSecret: boolean; // true=비밀, false=공개
};

export default function MapPage() {
  const [selected, setSelected] = useState<string | null>(null);
  const [boxes, setBoxes] = useState<Letterbox[]>([
    { id: "1", name: "공개함 A", lat: 37.5669, lng: 126.9782, isSecret: false },
    { id: "2", name: "비밀함 B", lat: 37.5655, lng: 126.9775, isSecret: true },
  ]);

  const selectedBox = useMemo(
    () => boxes.find((b) => b.id === selected) ?? null,
    [boxes, selected]
  );

  const navigate = useNavigate();

  useEffect(() => {
    fetchLetterboxes().then(setBoxes).catch(console.error);
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
                ownerName="(name)"
                onVerify={verifyPw}
                onEnter={() => {
                  setSelected(null);
                  navigate(`/boxes/${selectedBox.id}`);
                }}
              />
            ) : (
              <PublicBox
                boxName={selectedBox.name}
                ownerName="(name)"
                onEnter={() => {
                  setSelected(null);
                  navigate(`/boxes/${selectedBox.id}`);
                }}
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
