import { useEffect, useState } from "react";
import Header from "@/components/common/Header/Header";
import Button from "@/components/common/button/Button";
import styles from "./MapPage.module.css";
import BottomNav from "@/components/common/BottomNav/BottomNav";

export default function MapPage() {
  const [selected, setSelected] = useState<number | null>(null);

  useEffect(() => {
    // TODO: 여기서 Kakao Map 붙이기 (loadKakaoMap + Marker 배치)
  }, []);

  return (
    <div className={styles.page}>
      <Header title="지도" />
      <div className={styles.mapPlaceholder}>지도 자리 (KakaoMap)</div>
      <Button onClick={() => alert("편지함 만들기!")}>편지함 만들기</Button>
      <BottomNav />
    </div>
  );
}
