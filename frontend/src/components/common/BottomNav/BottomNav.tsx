import { NavLink } from "react-router-dom";
import styles from "./BottomNav.module.css";

export default function BottomNav() {
  return (
    <nav className={styles.nav}>
      <NavLink
        to="/map"
        className={({ isActive }) =>
          isActive ? styles.active : styles.inactive
        }
      >
        <img src="icons/map.svg" className={styles.icon} />
      </NavLink>
      <NavLink
        to="/mypage"
        className={({ isActive }) =>
          isActive ? styles.active : styles.inactive
        }
      >
        <img src="icons/profile.svg" className={styles.profileIcon} />
      </NavLink>
    </nav>
  );
}
