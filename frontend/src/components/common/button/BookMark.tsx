import styles from "./BookMark.module.css";

interface BookMarkProps {
  onClick?: () => void;
  isSave?: boolean;
}

export default function BookMark({ onClick, isSave = false }: BookMarkProps) {
  return (
    <button type="button" className={styles.container} onClick={onClick}>
      <img
        src={isSave ? "/icons/bookmark_fill.svg" : "/icons/bookmark_line.svg"}
        alt={isSave ? "북마크 해제" : "북마크 추가"}
        className={styles.icon}
      />
    </button>
  );
}
