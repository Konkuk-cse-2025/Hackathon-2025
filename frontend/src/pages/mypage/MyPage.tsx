import { useState, useEffect } from "react";
import styles from "./MyPage.module.css";
import BottomNav from "@/components/common/BottomNav/BottomNav";
import Header from "@/components/common/Header/Header";
import { AuthUser } from "@/apis/auth";
import LetterCard from "@/components/LetterPage/LetterCard";
import {
  fetchMyLetters,
  fetchSavedLetters,
  type Letter as APILetter,
} from "@/apis/mypage";

export default function MyPage() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [myLetters, setMyLetters] = useState<APILetter[]>([]);
  const [savedLetters, setSavedLetters] = useState<APILetter[]>([]);

  useEffect(() => {
    const raw = localStorage.getItem("user");
    if (raw) {
      try {
        setUser(JSON.parse(raw));
      } catch {
        localStorage.removeItem("user");
      }
    }

    // API 호출
    (async () => {
      try {
        const written = await fetchMyLetters();
        setMyLetters(written);

        const savedList = await fetchSavedLetters();
        setSavedLetters(savedList);
      } catch (e) {
        console.error("마이페이지 데이터 로드 실패", e);
      }
    })();
  }, []);

  return (
    <div className={styles.page}>
      {/* 봉투 플랩 헤더 */}
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <Header title={`${user ? user.name : "나"}의 편지함`} />
        </div>
      </header>

      <main className={styles.main}>
        {/* 내가 쓴 편지 */}
        <section className={`${styles.card} ${styles.pink}`}>
          <div className={styles.cardDots} aria-hidden="true">
            …
          </div>
          <h2 className={styles.cardTitle}>
            내가 쓴 편지
            <img
              src="/icons/Vector.png"
              alt=""
              aria-hidden="true"
              className={styles.inlineImg}
            />
          </h2>
          {/* 콘텐츠 영역: 리스트/링크가 들어갈 자리 */}
          <div className={styles.cardBody}>
            {myLetters.map((lt) => (
              <LetterCard
                key={lt.id}
                title={lt.title}
                body={lt.content}
                date={new Date(lt.createdAt).toLocaleDateString()}
              />
            ))}
          </div>
        </section>

        {/* 저장한 편지 */}
        <section className={`${styles.card} ${styles.green}`}>
          <div className={styles.cardDots} aria-hidden="true">
            …
          </div>
          <h2 className={styles.cardTitle}>
            저장한 편지
            <img
              src="/icons/mail_line.png"
              alt=""
              aria-hidden="true"
              className={styles.inlineImg}
            />
          </h2>
          <div className={styles.cardBody}>
            {" "}
            {savedLetters.map((lt) => (
              <LetterCard
                key={lt.id}
                title={lt.title}
                body={lt.content}
                date={new Date(lt.createdAt).toLocaleDateString()}
              />
            ))}
          </div>
        </section>
      </main>

      <BottomNav />
    </div>
  );
}
