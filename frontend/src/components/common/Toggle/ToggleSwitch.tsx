import styles from "./ToggleSwitch.module.css";

interface Props {
  checked: boolean;
  onChange: (checked: boolean) => void;
  id?: string;
}

export default function ToggleSwitch({ checked, onChange, id }: Props) {
  return (
    <button
      id={id}
      type="button"
      role="switch"
      aria-checked={checked}
      className={`${styles.toggle} ${checked ? styles.on : ""}`}
      onClick={() => onChange(!checked)}
    >
      <span className={styles.knob} />
    </button>
  );
}
