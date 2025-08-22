import { Outlet } from "react-router-dom";
import styles from "./App.module.css";


export default function App() {
  return (
    <div className={styles.app}>
      <Outlet />
    </div>
  );
}
