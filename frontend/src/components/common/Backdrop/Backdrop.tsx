import React from "react";
import { createPortal } from "react-dom";
import styles from "./Backdrop.module.css";

type BackdropProps = {
  onClose?: () => void; // 배경 클릭 시 닫기 (선택)
  children: React.ReactNode; // 안에 들어갈 팝업(Card 등)
  zIndex?: number; // 필요하면 조절
};

export default function Backdrop({
  onClose,
  children,
  zIndex = 2000,
}: BackdropProps) {
  const handleBackdropDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose?.();
  };

  return createPortal(
    <div
      className={styles.backdrop}
      style={{ zIndex }}
      onClick={handleBackdropDown}
      role="dialog"
      aria-modal="true"
    >
      <div className={styles.panel} onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>,
    document.body
  );
}
