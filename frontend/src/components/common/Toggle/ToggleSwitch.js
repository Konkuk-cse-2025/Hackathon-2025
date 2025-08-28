import { jsx as _jsx } from "react/jsx-runtime";
import styles from "./ToggleSwitch.module.css";
export default function ToggleSwitch({ checked, onChange, id }) {
    return (_jsx("button", { id: id, type: "button", role: "switch", "aria-checked": checked, className: `${styles.toggle} ${checked ? styles.on : ""}`, onClick: () => onChange(!checked), children: _jsx("span", { className: styles.knob }) }));
}
