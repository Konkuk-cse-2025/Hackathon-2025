import { NavLink } from "react-router-dom";
import styles from "./BottomNav.module.css";

export default function BottomNav() {
  return (
    <nav className={styles.nav}>
      <NavLink
        to="/map"
        className={({ isActive }) => (isActive ? styles.active : "")}
      >
        지도
      </NavLink>
      <NavLink
        to="/mypage"
        className={({ isActive }) => (isActive ? styles.active : "")}
      >
        마이
      </NavLink>
    </nav>
  );
}
