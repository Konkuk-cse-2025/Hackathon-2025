// src/pages/LetterDetailPage.tsx
import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import LetterPaper from "@/components/common/letter/LetterPaper";
import styles from "./LetterDetailPage.module.css";
import {
  getBookmarkState,
  bookmarkLetter,
  unbookmarkLetter,
  getLetterById,
} from "@/apis/letter";

export default function LetterDetailPage() {
  const { id: idParam, letterId: letterIdParam } = useParams();

  const lid = useMemo(() => {
    const raw = letterIdParam ?? idParam;
    const n = Number.parseInt(String(raw ?? ""), 10);
    return Number.isFinite(n) ? n : null;
  }, [idParam, letterIdParam]);

  const nav = useNavigate();

  // ✅ 훅은 최상단에서 고정 호출
  const [letter, setLetter] = useState<{
    id: number | null;
    title: string;
    date: string;
    to: string;
    from: string;
    body: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);
  const [initErr, setInitErr] = useState<string | null>(null);

  // 1) 편지 상세 불러오기
  useEffect(() => {
    if (!lid) {
      setError("잘못된 편지 ID");
      setLoading(false);
      return;
    }

    let alive = true;

    (async () => {
      try {
        const pos = await new Promise<GeolocationPosition>((resolve, reject) =>
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 3000,
          })
        );

        const lat = pos.coords.latitude.toFixed(6);
        const lng = pos.coords.longitude.toFixed(6);

        const data = await getLetterById(lid, { lat, lng });

        if (!alive) return;
        setLetter({
          id: lid,
          title: data.title,
          date: data.date ?? "날짜 없음",
          to: data.to ?? "To.",
          from: data.from ?? "From.",
          body: data.body ?? "내용 없음",
        });
        setError(null);
      } catch (e: any) {
        if (!alive) return;
        setError("편지 내용을 불러오지 못했습니다.");
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [lid]);

  // 2) 북마크 초기 상태 동기화  ← ❗️이 훅을 반드시 return들보다 위로 올림
  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!lid) {
        if (mounted) setInitErr("잘못된 편지 ID");
        return;
      }
      try {
        const { saved } = await getBookmarkState(lid);
        if (mounted) setSaved(saved);
      } catch (e: any) {
        if (!mounted) return;

        setInitErr(e?.response?.status === 401 ? " " : "상태를 불러오지 못했습니다");

        console.error("getBookmarkState failed", e);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [lid]);

  // 토글 핸들러
  const onToggleSave = async () => {
    if (lid == null || busy) return;
    setBusy(true);
    const nextSavedState = !saved; // (실제로는 낙관적 업데이트입니다)
    setSaved(nextSavedState);

    try {
      if (nextSavedState) {
        await bookmarkLetter(lid);
      }
    } catch (e) {
      console.error("toggle failed", e);
      setSaved(!nextSavedState); // 실패 시 롤백
    } finally {
      setBusy(false);
    }
  };

  // ✅ 훅 선언이 모두 끝난 뒤에 분기 렌더링
  if (loading) return <p>불러오는 중...</p>;
  if (error) return <p className={styles.errorMsg}>{error}</p>;
  if (!letter)
    return <p className={styles.errorMsg}>편지를 찾을 수 없습니다.</p>;

  return (
    <>
      <header className={styles.header}>
        <button
          className={styles.backBtn}
          onClick={() => nav(-1)}
          aria-label="뒤로 가기"
        >
          ←
        </button>
        <h1 className={styles.brand}>LetterUs</h1>
        <div className={styles.headerRight} />
      </header>

      <main className={styles.page}>
        {initErr && <p className={styles.errorMsg}>{initErr}</p>}

        <LetterPaper
          title={letter.title}
          date={letter.date}
          to={letter.to}
          from={letter.from}
          body={letter.body}
          saved={saved}
          onToggleSave={onToggleSave}
          // disabled={busy}
        />

        <section className={styles.actionBar}>
          <button className={styles.secondary} onClick={() => nav(-1)}>
            ← 편지함으로
          </button>
        </section>
      </main>
    </>
  );
}
