import React from "react";
import Card from "@/components/common/Card/Card";
import Button from "@/components/common/button/Button";
import styles from "./LetterBoxPopup.module.css";

type PublicBoxProps = {
  boxName: string;
  ownerName: string;
  onEnter: () => void; // 편지함 들어가기
  onWrite?: () => void; // 바로 쓰기 (선택)
  onClose?: () => void;
};

export default function PublicBox({
  boxName,
  ownerName,
  onEnter,
  onClose,
}: PublicBoxProps) {
  return (
    
    <Card className={styles.popupCard}>
      <div className={styles.header}>
        <img
            src="/icons/mailbox.png"
            className={styles.icon}
          />
        <div className={styles.title}>
          {boxName}
          <button
            type="button"
            aria-label="닫기"
            className={styles.close}
            onClick={onClose}
          >
            <img src="icons/x.svg" alt="닫기" className={styles.closeIcon} />
          </button>
        </div>
      </div>

      <div className={styles.actionsRow}>
        <Button onClick={onEnter} style={{ backgroundColor: "#8a6851" }}>
          편지함 열기
        </Button>
      </div>
    </Card>
  );
}
