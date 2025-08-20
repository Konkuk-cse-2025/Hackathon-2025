import { Outlet } from "react-router-dom";
import styles from "./App.module.css";
import BottomNav from "@/components/common/BottomNav/BottomNav";

export default function App() {
  return (
    <div className={styles.app}>
      <Outlet />
    </div>
  );
}
