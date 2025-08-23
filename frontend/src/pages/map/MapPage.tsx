import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { fetchLetterboxes } from "@/apis/Letterboxes";

import Header from "@/components/common/Header/Header";
import Button from "@/components/common/button/Button";
import NaverMap from "@/components/MapPage/NaverMap";
import styles from "./MapPage.module.css";
import BottomNav from "@/components/common/BottomNav/BottomNav";

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

  useEffect(() => {
    fetchLetterboxes().then(setBoxes).catch(console.error);
  }, []);

  return (
    <div className={styles.page}>
      <Header title="지도" />
      <div className={styles.mapPlaceholder}>
        <NaverMap
          letterboxes={boxes}
          selectedId={selected}
          onSelect={(id) => setSelected(id)}
        />
        <div className={styles.cta}>
          <Button
            onClick={() => alert("편지함 만들기!")}
            style={{ zIndex: 10 }}
          >
            편지함 만들기
          </Button>
        </div>
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
