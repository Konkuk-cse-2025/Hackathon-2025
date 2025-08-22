import { useEffect, useState } from "react";
import Header from "@/components/common/Header/Header";
import BottomNav from "@/components/common/BottomNav/BottomNav";
import styles from "./MapPage.module.css";
import Button from "@/components/common/button/Button";
import styles from "./MapPage.module.css";
import BottomNav from "@/components/common/BottomNav/BottomNav";
import NaverMap from "@/components/MapPage/NaverMap";


export default function MapPage() {
  const [selected, setSelected] = useState<number | null>(null);

  useEffect(() => {
    // TODO: 여기서 Kakao Map 붙이기 (loadKakaoMap + Marker 배치)
  }, []);

  return (
    <div className={styles.page}>
      <Header title="지도" />
<<<<<<< HEAD
<<<<<<< HEAD
      <div className={styles.mapPlaceholder}>
        <NaverMap />
      </div>
=======
      <div className={styles.mapPlaceholder}>지도 자리 (KakaoMap)</div>

>>>>>>> origin/main
=======
      <div className={styles.mapPlaceholder}>
        <NaverMap />
      </div>

      <div className={styles.mapPlaceholder}>지도 자리 (KakaoMap)</div>


>>>>>>> 16a53256993c42404ccdbdbbf21d9ac269598d37
      <div className={styles.cta}>
        <Button onClick={() => alert("편지함 만들기!")}>편지함 만들기</Button>
      </div>

      <BottomNav />
    </div>
  );
}
