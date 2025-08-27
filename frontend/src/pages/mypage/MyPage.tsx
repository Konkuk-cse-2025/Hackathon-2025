import { useState, useEffect } from "react";
import styles from "./MyPage.module.css";
import BottomNav from "@/components/common/BottomNav/BottomNav";
import Header from "@/components/common/Header/Header";
import { AuthUser } from "@/apis/auth";
import LetterCard from "@/components/LetterPage/LetterCard";

type Letter = {
  id: string;
  title: string;
  body: string;
  date: string;
};

export default function MyPage() {
  const [user, setUser] = useState<AuthUser | null>(null);

  const myLetters: Letter[] = [
    {
      id: "1",
      title: "첫 편지",
      body: "오늘은 정말 특별한 하루였어. 같이 걸었던 길이 기억나...",
      date: "2025-08-01",
    },
    {
      id: "2",
      title: "여름밤의 기록",
      body: "밤바람이 시원해서 기분이 좋았어. 불빛도 아름다웠고...",
      date: "2025-08-10",
    },
    {
      id: "3",
      title: "여름밤의 기록",
      body: "밤바람이 시원해서 기분이 좋았어. 불빛도 아름다웠고...",
      date: "2025-08-10",
    },
    {
      id: "4",
      title: "여름밤의 기록",
      body: "밤바람이 시원해서 기분이 좋았어. 불빛도 아름다웠고...",
      date: "2025-08-10",
    },
  ];

  const savedLetters: Letter[] = [
    {
      id: "a",
      title: "비밀 이야기",
      body: "누구에게도 말하지 못했던 내 마음을 여기에 남겨...",
      date: "2025-07-15",
    },
    {
      id: "b",
      title: "너에게 보내는 편지",
      body: "오랜만이야. 잘 지내고 있지? 네가 보고 싶어...",
      date: "2025-07-22",
    },
    {
      id: "c",
      title: "너에게 보내는 편지",
      body: "오랜만이야. 잘 지내고 있지? 네가 보고 싶어...",
      date: "2025-07-22",
    },
  ];

  useEffect(() => {
    const saved = localStorage.getItem("user");
    if (saved) {
      try {
        setUser(JSON.parse(saved));
      } catch {
        localStorage.removeItem("user");
      }
    }
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
                body={lt.body}
                date={lt.date}
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
                body={lt.body}
                date={lt.date}
              />
            ))}
          </div>
        </section>
      </main>

      <BottomNav />
    </div>
  );
}
