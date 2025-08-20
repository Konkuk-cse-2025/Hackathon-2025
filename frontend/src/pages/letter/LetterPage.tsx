import { useParams } from "react-router-dom";
import Header from "@/components/common/Header/Header";
import styles from "./LetterPage.module.css";

export default function LetterPage() {
  const { id } = useParams();
  // TODO: id로 상세 불러오기
  return (
    <div className={styles.page}>
      <Header title="편지" />
      <article className={styles.card}>
        <h2>편지 제목 #{id}</h2>
        <p>편지 본문…</p>
      </article>
    </div>
  );
}
