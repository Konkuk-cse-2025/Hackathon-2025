import { useState, useEffect } from "react";
import styles from "./MyPage.module.css";
import BottomNav from "@/components/common/BottomNav/BottomNav";
import Header from "@/components/common/Header/Header";
import { AuthUser } from "@/apis/auth";

export default function MyPage() {
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem("user");
    if (saved) {
      try {
        setUser(JSON.parse(saved));
      } catch {
        // 파싱 실패 시 안전하게 초기화
        localStorage.removeItem("user");
      }
    }
  }, []);
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <Header title={`${user ? user.name : "나"}의 편지함`} />
        <img
          src="/icons/letterbox.png"
          alt=""
          className={styles.headerEmoji}
          aria-hidden="true"
        />
      </header>

      <main className={styles.main}>
        <section className={styles.card}>
          <h2 className={styles.cardTitle}>내가 쓴 편지</h2>
        </section>

        <section className={styles.card}>
          <h2 className={styles.cardTitle}>저장한 편지</h2>
        </section>
      </main>
      <BottomNav />
    </div>
  );
}
