import React, { useState, useCallback } from "react";
import Card from "@/components/common/Card/Card";
import Button from "@/components/common/button/Button";
import Input from "@/components/common/Input/Input";
import styles from "./LetterBoxPopup.module.css";

type SecretBoxProps = {
  boxName: string;
  ownerName: string;
  onVerify: (password: string) => Promise<boolean> | boolean;
  onEnter: () => void; // 검증 성공 후 진입
};

export default function SecretBox({
  boxName,
  ownerName,
  onVerify,
  onEnter,
}: SecretBoxProps) {
  const [pw, setPw] = useState("");
  const [loading, setLoading] = useState(false);
  const [ok, setOk] = useState<boolean | null>(null); // null: idle, true: 성공, false: 실패
  const [error, setError] = useState<string>("");

  const handleVerify = useCallback(async () => {
    if (!pw) {
      setError("비밀번호를 입력해 주세요.");
      setOk(null);
      return;
    }
    setLoading(true);
    setError("");
    try {
      const result = await onVerify(pw);
      setOk(result);
      if (result) onEnter();
      else setError("비밀번호가 올바르지 않습니다.");
    } catch {
      setOk(false);
      setError("잠시 후 다시 시도해 주세요.");
    } finally {
      setLoading(false);
    }
  }, [pw, onVerify, onEnter]);

  return (
    <Card className={`${styles.popupCard} ${styles.secret}`}>
      <div className={styles.header}>
        <div className={styles.title}>
          <span className={styles.lock} aria-hidden>
            🔒
          </span>{" "}
          {boxName}
        </div>
        <div className={styles.sub}>created by. {ownerName}</div>
      </div>

      <div className={styles.inlineRow}>
        <Input
          label="비밀번호"
          type="password"
          value={pw}
          placeholder="비밀번호를 입력해 주세요"
          onChange={(e) => setPw(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleVerify()}
          className={ok === false ? styles.inputError : ""}
        />
        <Button
          className={styles.inlineBtn}
          onClick={handleVerify}
          disabled={loading}
        >
          {loading ? "확인중..." : "확인"}
        </Button>
      </div>

      {/* 상태 메시지 */}
      <div
        role="status"
        className={
          ok === true
            ? styles.statusOk
            : ok === false || error
            ? styles.statusErr
            : styles.statusIdle
        }
      >
        {ok === true && "인증됨"}
        {ok === false && error}
        {!ok && error && error}
      </div>

      <Button onClick={handleVerify} disabled={loading}>
        편지함 열기
      </Button>
    </Card>
  );
}
