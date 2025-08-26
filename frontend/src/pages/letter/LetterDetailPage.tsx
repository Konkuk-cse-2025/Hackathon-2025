// src/pages/LetterDetailPage.tsx
import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import LetterPaper from "@/components/common/letter/LetterPaper";
import styles from "./LetterDetailPage.module.css";
import {
  getBookmarkState,
  bookmarkLetter,
  unbookmarkLetter,
} from "@/apis/letter"; // ← 내가 준 letter.ts에 있음

export default function LetterDetailPage() {
  // 🔻 이 줄만 남기고
const { id: idParam, letterId: letterIdParam } = useParams();

// 🔻 안전 파싱 (letterId 우선, 없으면 id)
const lid = useMemo(() => {
  const raw = letterIdParam ?? idParam;
  const n = Number.parseInt(String(raw ?? ""), 10);
  return Number.isFinite(n) ? n : null;
}, [idParam, letterIdParam]);


  const nav = useNavigate();

  // (임시) 실제 상세 API 응답으로 대체
  const letter = {
    id: lid,
    title: "비오는 날의 안부",
    date: "2025.01.03",
    to: "To.",
    from: "From.",
    body: `창밖에는 하루 종일 비가 내렸어.... 어쩌구 저쩌구`,
  };

  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);
  const [initErr, setInitErr] = useState<string | null>(null);

  // ⛳ 초기 저장 상태 동기화 (GET /letters/:id/bookmark)
  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!lid) {
        setInitErr("잘못된 편지 ID");
        return;
      }
      try {
        const { saved } = await getBookmarkState(lid);
        if (mounted) setSaved(saved);
      } catch (e: any) {
        // 401/403이면 로그인 필요
        if (mounted) setInitErr(e?.response?.status === 401 ? "로그인이 필요해요" : "상태를 불러오지 못했습니다");
        console.error("getBookmarkState failed", e);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [lid]);

  // ✅ 토글: API 성공 후에만 UI 상태 변경 (낙관적 업데이트 ❌)
  // 기존 (문제): onToggleSave 함수 안에서 lid를 다시 선언해서 덮어씀
// const lid = Number((letterId ?? id) as string);

// ✅ 수정
console.log('toggle click', { lid, saved });
const onToggleSave = async () => {
  if (lid == null || busy) return;

  const next = !saved;     // 낙관적 업데이트
  setSaved(next);
  try {
    if (next) {
      await bookmarkLetter(lid);                 // POST /letters/:id/bookmark
      nav("/mypage", { state: { justSaved: lid } }); // 저장 시에만 전달
    } else {
      await unbookmarkLetter(lid);               // DELETE /letters/:id/bookmark
    }
  } catch (e) {
    console.error("toggle failed", e);
    setSaved(!next); // 실패 시 롤백
  }
};


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
        {/* 초기 에러 메시지 (선택) */}
        {initErr && <p className={styles.errorMsg}>{initErr}</p>}

        <LetterPaper
          title={letter.title}
          date={letter.date}
          to={letter.to}
          from={letter.from}
          body={letter.body}
          saved={saved}            // ← boolean
          onToggleSave={onToggleSave} // ← 함수 (아래 주석 참고)
         // disabled={busy}          // 버튼이 disabled prop을 받는다면 전달
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
