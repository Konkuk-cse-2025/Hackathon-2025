import { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import styles from "./Letterbox.module.css";
import Button from "@/components/common/button/Button";
import Toggle from "@/components/common/Toggle/ToggleSwitch";
import { createLetterbox } from "@/apis/Letterboxes";

// 환경변수로 API 베이스 경로를 뺄 수 있어요. (Vite 기준)
const API_BASE = import.meta.env.VITE_API_BASE_URL || ""; // 예: "https://api.example.com"

export default function CreateLetterboxPage() {
  const navigate = useNavigate();

  // 폼 상태
  const [name, setName] = useState("");
  const [passwordEnabled, setPasswordEnabled] = useState(false);
  const [password, setPassword] = useState("");
  const [passwordHint, setPasswordHint] = useState("");

  // 위치(기본값은 임의로 서울시청)
  const [lat, setLat] = useState(37.5665);
  const [lng, setLng] = useState(126.978);

  // UI 상태
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // 브라우저 위치 가져오기(가능하면)
  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLat(pos.coords.latitude);
        setLng(pos.coords.longitude);
      },
      () => {} // 실패해도 기본값 유지
    );
  }, []);

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

    try {
      setSubmitting(true);
      await createLetterbox({
        name: name.trim(),
        isSecret: passwordEnabled,
        password: passwordEnabled ? password : undefined,
        passwordHint: passwordEnabled ? passwordHint : undefined,
        lat,
        lng,
      });
      navigate("/map", { replace: true });
    } catch (e: any) {
      setErrorMsg(e?.message || "생성 중 오류가 발생했어요.");
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
          <p className={`${styles.subtitle} clp-subtitle`}>
            새로운 편지함을 생성해보세요
          </p>
        </div>

        {/* 이름 */}
        <div className={styles.field}>
          <label htmlFor="boxName" className={styles.label}>
            편지함 이름
          </label>
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
            <label htmlFor="pwToggle" className={styles.label}>
              비밀번호 설정
            </label>
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
              <label htmlFor="boxPw" className={styles.label}>
                비밀번호
              </label>
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
              <label htmlFor="boxPwHint" className={styles.label}>
                비밀번호 힌트
              </label>
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
