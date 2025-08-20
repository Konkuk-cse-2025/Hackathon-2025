import Header from "@/components/common/Header/Header";
import styles from "./WritePage.module.css";

export default function WritePage() {
  return (
    <div className={styles.page}>
      <Header title="편지 쓰기" />
      <form className={styles.form}>
        <input placeholder="제목" />
        <textarea placeholder="내용" rows={10} />
        <div className={styles.actions}>
          <button type="button">임시저장</button>
          <button type="submit">저장</button>
        </div>
      </form>
    </div>
  );
}
