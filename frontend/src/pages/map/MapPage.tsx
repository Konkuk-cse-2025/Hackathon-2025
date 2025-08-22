import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import Header from "@/components/common/Header/Header";
import BottomNav from "@/components/common/BottomNav/BottomNav";
import styles from "./MapPage.module.css";
import Button from "@/components/common/button/Button";
import NaverMap from "@/components/MapPage/NaverMap";


export default function MapPage() {
  const [selected, setSelected] = useState<number | null>(null);

  useEffect(() => {
    // TODO: 여기서 Kakao Map 붙이기 (loadKakaoMap + Marker 배치)
  }, []);

  return (
    <div className={styles.page}>
      <Header title="지도" />
      <div className={styles.mapPlaceholder}> 
        <NaverMap />
      </div>

      <div className={styles.mapPlaceholder}>지도 자리 (KakaoMap)</div>


      <div className={styles.cta}>
        <div className={styles.actionsRight}>
        <NavLink to="/letterbox">
          <Button fullWidth={false} rightIcon={<img src="/icons/letterbox.png" alt="" aria-hidden="true" />}></Button>
        </NavLink>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
