import styles from "./MyPage.module.css";
import BottomNav from "@/components/common/BottomNav/BottomNav";
import Header from "@/components/common/Header/Header";

export default function MyPage() {
  return (
    <div className={styles.page}>
      {/* 봉투 플랩 헤더 */}
      <header className={styles.header}>
        <Header title="나의 편지함" />
        <img
          src="/icons/letterbox.png"
          alt=""
          className={styles.headerEmoji}
          aria-hidden="true"
        />
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
          <div className={styles.cardBody}>
            {" "}
            {myLetters
              .filter((lt) => lt.id)
              .map((lt) => (
                <button
                    key={lt.id}
                    type="button"
                    className={styles.letterButton}
                    onClick={() => nav(`/letters/${lt.id}`)}
                    aria-label={`${lt.title} 상세보기`}
                    // 수정: mailboxId와 lt.id 포함
                  >
                    <LetterCard title={lt.title} body={lt.body} date={lt.date} />
                  </button>
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
            {savedLetters
              .filter((lt) => lt.id)
              .map((lt) => (
                <button
                    key={lt.id}
                    type="button"
                    className={styles.letterButton}
                    onClick={() => nav(`/letters/${lt.id}`)}
                    aria-label={`${lt.title} 상세보기`}
                    // 수정: mailboxId와 lt.id 포함
                  >
                    <LetterCard title={lt.title} body={lt.body} date={lt.date} />
                  </button>
              ))}
          </div>
        </section>
      </main>

      <BottomNav />
    </div>
  );
}
