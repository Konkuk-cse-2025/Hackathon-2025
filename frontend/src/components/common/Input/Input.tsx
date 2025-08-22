import styles from "./Input.module.css";

interface Input extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

export default function Input({ label, id, className, ...rest }: InputProps) {
  const inputId = id ?? `input-${label}`;

  return (
    <div className={styles.wrapper}>
      <label htmlFor={inputId} className={styles.label}>
        {label}
      </label>
      <input
        id={inputId}
        className={`${styles.input} ${className ?? ""}`}
        {...rest}
      />
    </div>
  );
}
