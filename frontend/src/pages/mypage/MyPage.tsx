
import styles from "./MyPage.module.css";
import BottomNav from "@/components/common/BottomNav/BottomNav";
import Header from "@/components/common/Header/Header"



export default function MyPage() {
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <Header title="나의 편지함"/>
        <img
          src="/icons/letterbox.png"
          alt=""
          className={styles.headerEmoji}
          aria-hidden="true"
        />

      </header>

        <span className={styles.headerText}>나의 편지함</span>

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
