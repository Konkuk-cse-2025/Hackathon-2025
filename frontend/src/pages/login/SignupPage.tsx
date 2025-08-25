import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import styles from "./LoginPage.module.css";
import { signup } from "@/apis/auth"; // 앞서 만든 signup API 사용

export default function SignupPage() {
  const nav = useNavigate();
  const [id, setId] = useState("");
  const [name, setName] = useState("");
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // 간단 검증
    if (!id || !name || !pw) return setError("모든 필드를 입력해주세요.");
    if (pw !== pw2) return setError("비밀번호가 일치하지 않습니다.");
    if (pw.length < 4) return setError("비밀번호는 8자 이상이어야 합니다.");

    try {
      setLoading(true);
      await signup({ id, name, password: pw }); // ← 성공만 확인

      // ✅ 토큰 저장하지 말고 로그인 화면으로 보냄 (뒤로가기 방지 + 아이디 프리필)
      nav("/login", { replace: true, state: { id } });
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || "회원가입에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <form className={styles.card} onSubmit={onSubmit}>
        <img src="/icons/Logo.png" alt="" aria-hidden="true" className={styles.inlineImg} />
        <h2>회원가입</h2>

        <input
          placeholder="아이디"
          value={id}
          onChange={(e) => setId(e.target.value)}
        />
        <input
          placeholder="이름"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          placeholder="비밀번호"
          type="password"
          value={pw}
          onChange={(e) => setPw(e.target.value)}
        />
        <input
          placeholder="비밀번호 확인"
          type="password"
          value={pw2}
          onChange={(e) => setPw2(e.target.value)}
        />

        <button type="submit" disabled={loading}>
          {loading ? "가입 중..." : "가입하기"}
        </button>

        {error && <p className={styles.error}>{error}</p>}

        <p className={styles.helper}>
          이미 계정이 있나요?{" "}
          <Link to="/login" className={styles.link}>
            로그인
          </Link>
        </p>
      </form>
    </div>
  );
}
