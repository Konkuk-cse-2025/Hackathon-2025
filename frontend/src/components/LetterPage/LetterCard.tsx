import styles from "./LetterCard.module.css";

export default function LetterCard({
  title,
  body,
  date,
  className = "",
}: {
  title: string;
  body: string;
  date: string;
  className?: string;
}) {
  return (
    <div className={`${styles.letterCard} ${className}`}>
      {/* 상단: 제목 + 날짜 */}
      <div className={styles.header}>
        <h1 className={styles.title}>{title}</h1>
        <span className={styles.date}>{date}</span>
      </div>

      {/* 본문 첫 줄*/}
      <p className={styles.body}>{body}</p>
    </div>
  );
}
