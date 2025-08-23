import styles from "./Header.module.css";

export default function Header({ title }: { title: string }) {
  return (
    <header className={styles.header}>
        <span className={styles.headerText}>{title}</span>
    </header>
  );
}
