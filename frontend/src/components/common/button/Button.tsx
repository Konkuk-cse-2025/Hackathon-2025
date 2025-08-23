import React from "react";
import styles from "./Button.module.css";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  /** 버튼을 100% 너비로 */
  fullWidth?: boolean;
  /** 왼쪽 아이콘 (img/svg/컴포넌트 아무거나) */
  leftIcon?: React.ReactNode;
  /** 오른쪽 아이콘 */
  rightIcon?: React.ReactNode;
};

function cx(...args: Array<string | false | undefined>) {
  return args.filter(Boolean).join(" ");
}

export default function Button({
  fullWidth = true,
  leftIcon,
  rightIcon,
  className,
  children,
  ...rest
}: ButtonProps) {
  return (
    <button
      {...rest}
      className={cx(styles.button, fullWidth && styles.full, className)}
    >
      {leftIcon && <span className={styles.icon}>{leftIcon}</span>}
      <span className={styles.label}>{children}</span>
      {rightIcon && <span className={styles.icon}>{rightIcon}</span>}
    </button>
  );
}
