import Header from "@/components/common/Header/Header";
import styles from "./MyPage.module.css";
import BottomNav from "@/components/common/BottomNav/BottomNav";


export default function MyPage() {
  return (
    <div className={styles.page}>
      <Header title="나의 편지함" />
      <ul className={styles.list}>
        <li className={styles.item}>
          <span>2025-08-20</span>
          <strong>첫 편지</strong>
        </li>
      </ul>

      <BottomNav />

    </div>
  );
}
