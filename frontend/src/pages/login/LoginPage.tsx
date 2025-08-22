import { useState } from "react";
import styles from "./LoginPage.module.css";
import BottomNav from "@/components/common/BottomNav/BottomNav";
import { useNavigate } from "react-router-dom";

export default function LoginPage() {
  const nav = useNavigate();
  const [id, setId] = useState("");
  const [pw, setPw] = useState("");

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: 실제 로그인 연동
    nav("/map");
  };

  return (
    <div className={styles.page}>
      <form className={styles.card} onSubmit={onSubmit}>
        <h2>LetterUs</h2>
        <input
          placeholder="아이디"
          value={id}
          onChange={(e) => setId(e.target.value)}
        />
        <input
          placeholder="비밀번호"
          type="password"
          value={pw}
          onChange={(e) => setPw(e.target.value)}
        />
        <button type="submit">로그인</button>
      </form>

      <BottomNav />

    </div>
  );
}
