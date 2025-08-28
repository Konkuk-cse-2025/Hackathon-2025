import styles from "./LetterPaper.module.css";
import BookMark from "@/components/common/button/BookMark";

export type LetterPaperProps = {
  title: string;
  date: string; // "YYYY.MM.DD" 같은 표시용 문자열
  to?: string;
  from?: string;
  body: string; // \n 포함된 본문 (pre-wrap로 렌더)
  saved?: boolean;
  onToggleSave?: () => void;
  // 헤더/액션 버튼은 페이지에서 감싸서 쓰도록 단순하게 유지
};

export default function LetterPaper({
  title,
  date,
  to = "To.",
  from = "From.",
  body,
  saved,
  onToggleSave,
}: LetterPaperProps) {
  return (
    <div className={styles.wrap}>
      {/* 제목 + 날짜 */}
      <section className={styles.titleArea}>
        <h2 className={styles.title}>{title}</h2>
        <time className={styles.date}>{date}</time>
      </section>

      {/* 편지지 */}
      <section className={styles.paperCard}>
        <div className={styles.paper} aria-label="편지 내용">
          <div className={styles.paperInner}>
            <span className={styles.toLabel}>To. {to || "To."}</span>
            <div className={styles.body}>{body}</div>
            <span className={styles.fromLabel}>From. {from || "From."}</span>
          </div>
        </div>
        <div className={styles.bookmark}>
          <BookMark onClick={onToggleSave} isSave={saved} />
        </div>
      </section>
    </div>
  );
}
