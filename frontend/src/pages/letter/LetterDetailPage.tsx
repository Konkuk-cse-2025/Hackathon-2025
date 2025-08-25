import { useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import LetterPaper from "@/components/common/letter/LetterPaper";
import styles from "./LetterDetailPage.module.css";

export default function LetterDetailPage() {
  const { id, letterId } = useParams();
  const nav = useNavigate();

  // TODO: 실제 API에서 가져오기
  const letter = {
    title: "비오는 날의 안부",
    date: "2025.01.03",
    to: "To.",
    from: "From.",
    body: `창밖에는 하루 종일 비가 내렸어.... 어쩌구 저쩌구`,
    saved: false,
  };
  const [saved, setSaved] = useState<boolean>(letter.saved);
  const onToggleSave = () => setSaved((prev) => !prev);

  return (
    <>
      <header className={styles.header}>
        <button
          className={styles.backBtn}
          onClick={() => nav(-1)}
          aria-label="뒤로 가기"
        >
          ←
        </button>
        <h1 className={styles.brand}>LetterUs</h1>
        <div className={styles.headerRight} />
      </header>
      <main className={styles.page}>
        {/* 상단 헤더 */}

        {/* 편지지 */}
        <LetterPaper
          title={letter.title}
          date={letter.date}
          to={letter.to}
          from={letter.from}
          body={letter.body}
          saved={saved}
          onToggleSave={onToggleSave}
        />
        {/* 하단 액션 */}
        <section className={styles.actionBar}>
          <button className={styles.secondary} onClick={() => nav(-1)}>
            ← 편지함으로
          </button>
        </section>
      </main>
    </>
  );
}
