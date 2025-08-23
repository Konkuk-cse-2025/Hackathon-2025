import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";

import Header from "@/components/common/Header/Header";
import Button from "@/components/common/button/Button";
import NaverMap from "@/components/MapPage/NaverMap";
import styles from "./MapPage.module.css";
import BottomNav from "@/components/common/BottomNav/BottomNav";

export default function MapPage() {
  const [selected, setSelected] = useState<number | null>(null);

  useEffect(() => {}, []);

  return (
    <div className={styles.page}>
      <Header title="지도" />
      <div className={styles.mapPlaceholder}>
        <NaverMap />
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
