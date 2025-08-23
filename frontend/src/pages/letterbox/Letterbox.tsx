import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import styles from "./Letterbox.module.css";
import Button from "@/components/common/button/Button";
import Toggle from "@/components/common/Toggle/ToggleSwitch";



// 환경변수로 API 베이스 경로를 뺄 수 있어요. (Vite 기준)
const API_BASE = import.meta.env.VITE_API_BASE_URL || ""; // 예: "https://api.example.com"

export default function CreateLetterboxPage() {
  const navigate = useNavigate();

  // 폼 상태
  const [name, setName] = useState("");
  const [passwordEnabled, setPasswordEnabled] = useState(false);
  const [password, setPassword] = useState("");
  const [passwordHint, setPasswordHint] = useState("");

  // UI 상태
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async () => {
    setErrorMsg(null);

    // 간단 검증
    if (!name.trim()) {
      setErrorMsg("편지함 이름을 입력해주세요.");
      return;
    }
    if (passwordEnabled && !password.trim()) {
      setErrorMsg("비밀번호를 입력해주세요.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`${API_BASE}/api/letterboxes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          passwordEnabled,
          password: passwordEnabled ? password : undefined,
          passwordHint: passwordEnabled ? passwordHint : undefined,
        }),
      });

      if (!res.ok) {
        // 백엔드에서 오는 에러 메시지를 최대한 표시
        const text = await res.text().catch(() => "");
        throw new Error(text || `요청 실패 (status ${res.status})`);
      }

      // 성공 시 이동 (원하면 다른 경로로 바꿔도 OK)
      navigate("/map", { replace: true });
    } catch (err: any) {
      setErrorMsg(err?.message || "생성 중 오류가 발생했어요.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        {/* Header (타이포/색상은 별도 헤더 CSS) */}
        <div className={styles.header}>
          <h1 className={`${styles.title} clp-title`}>편지함 만들기</h1>
          <p className={`${styles.subtitle} clp-subtitle`}>새로운 편지함을 생성해보세요</p>
        </div>

        {/* 이름 */}
        <div className={styles.field}>
          <label htmlFor="boxName" className={styles.label}>편지함 이름</label>
          <input
            id="boxName"
            type="text"
            placeholder="편지함 이름을 입력하세요"
            className={styles.input}
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={submitting}
          />
        </div>

        {/* 비밀번호 토글 */}
        <div className={styles.field}>
          <div className={styles.fieldRow}>
            <label htmlFor="pwToggle" className={styles.label}>비밀번호 설정</label>
            <Toggle
              id="pwToggle"
              checked={passwordEnabled}
              onChange={setPasswordEnabled}
            />
          </div>
        </div>

        {/* 비밀번호/힌트 (조건부) */}
        {passwordEnabled && (
          <div className={styles.password}>
            <div className={styles.field}>
              <label htmlFor="boxPw" className={styles.label}>비밀번호</label>
              <input
                id="boxPw"
                type="password"
                placeholder="비밀번호를 입력하세요"
                className={styles.input}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={submitting}
              />
            </div>
            <div className={styles.field}>
              <label htmlFor="boxPwHint" className={styles.label}>비밀번호 힌트</label>
              <input
                id="boxPwHint"
                type="text"
                placeholder="비밀번호 힌트를 입력하세요"
                className={styles.input}
                value={passwordHint}
                onChange={(e) => setPasswordHint(e.target.value)}
                disabled={submitting}
              />
            </div>
          </div>
        )}

        {/* 에러 메시지 */}
        {errorMsg && (
          <div role="alert" style={{ color: "#b00020", margin: "8px 0" }}>
            {errorMsg}
          </div>
        )}

        {/* 액션 버튼 */}
        <div className={styles.actions}>
          <Button
            type="button"
            className="btn btn-primary"
            style={{ width: "100%" }}
            onClick={handleSubmit}
            disabled={submitting}
          >
            {submitting ? "만드는 중..." : "편지함 만들기"}
          </Button>

          <NavLink to="/map" style={{ width: "100%" }}>
            <Button
              type="button"
              className="btn btn-secondary"
              style={{ width: "100%" }}
              disabled={submitting}
            >
              취소
            </Button>
          </NavLink>
        </div>
      </div>
    </div>
  );
}

