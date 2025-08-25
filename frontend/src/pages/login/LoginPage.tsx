import { useState } from "react";
import styles from "./LoginPage.module.css";
import { useNavigate } from "react-router-dom";
import { login } from "@/apis/auth";

export default function LoginPage() {
  const nav = useNavigate();
  const [id, setId] = useState("");
  const [pw, setPw] = useState("");
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      const { user, token } = await login({ id, password: pw });
      localStorage.setItem("token", token); // 토큰 저장
      localStorage.setItem("user", JSON.stringify(user));
      console.log("로그인 성공:", user);

      nav("/map"); // 로그인 성공 시 지도 페이지로 이동
    } catch (err: any) {
      console.error("로그인 실패", err);
      setError("아이디 또는 비밀번호가 올바르지 않습니다.");
    }
  };

  return (
    <div className={styles.page}>
      <form className={styles.card} onSubmit={onSubmit}>
        <img src="/icons/Logo.png" alt="" aria-hidden="true" className={styles.inlineImg} />
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
        {error && <p className={styles.error}>{error}</p>}
      </form>
    </div>
  );
}
