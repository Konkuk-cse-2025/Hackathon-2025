import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Header from "@/components/common/Header/Header";
import styles from "./LetterPage.module.css";
import LetterCard from "@/components/LetterPage/LetterCard";
import Button from "@/components/common/button/Button";

type Letter = {
  id: string;
  title: string;
  body: string;
  date: string; // ISO "YYYY-MM-DD"
};

const MOCK_LETTERS: Letter[] = [
  {
    id: "l3",
    title: "비 오는 날의 안부",
    body: "우산 챙겼지? ...",
    date: "2025-01-03",
  },
  {
    id: "l2",
    title: "새해 다짐",
    body: "올해는 더 자주 편지를 쓰자.",
    date: "2025-01-02",
  },
  {
    id: "l1",
    title: "첫 편지",
    body: "여기에 우리의 첫 기록을 남겨.",
    date: "2025-01-01",
  },
];

export default function LetterPage() {
  const { id } = useParams(); // 편지함 id
  const nav = useNavigate();
  // TODO: id로 상세 불러오기

  const [letters, setLetters] = useState<Letter[]>([]);

  useEffect(() => {
    // TODO: id로 상세 불러오기 (API 연동)
    // 예: api.get(`/letterboxes/${id}/letters`).then(res => setLetters(res.data))
    setLetters(MOCK_LETTERS);
  }, [id]);

  const sortedLetters = useMemo(
    () => [...letters].sort((a, b) => (a.date < b.date ? 1 : -1)),
    [letters]
  );
  return (
    <>
      <Header title="편지함 제목" />
      <div className={styles.page}>
        <div className={styles.title}>
          <img src="/icons/mail_fill.svg" />
          <h1 className={styles.titleText}>저장된 편지</h1>
        </div>
        {sortedLetters.length === 0 ? (
          <div className={styles.empty}>아직 저장된 편지가 없어요.</div>
        ) : (
          <ul className={styles.list}>
            {sortedLetters.map((lt) => (
              <li key={lt.id} className={styles.item}>
                <LetterCard title={lt.title} body={lt.body} date={lt.date} />
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className={styles.footer}>
        <Button className={styles.writeButton} onClick={() => nav(`/write`)}>
          편지 쓰기
        </Button>
        <Button className={styles.exitButton} onClick={() => nav(-1)}>
          편지함 나가기
        </Button>
      </div>
    </>
  );
}
