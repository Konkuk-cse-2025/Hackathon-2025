import styles from "./Button.module.css";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  fullWidth?: boolean;
}

export default function Button({
  fullWidth = true,
  className,
  children,
  ...rest
}: ButtonProps) {
  return (
    <button
      className={`${styles.button} ${fullWidth ? styles.full : ""} ${
        className ?? ""
      }`}
      {...rest}
    >
      {children}
    </button>
  );
}
