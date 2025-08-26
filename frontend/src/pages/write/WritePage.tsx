import {
  useEffect,
  useMemo,
  useRef,
  useState,
  ChangeEvent,
  KeyboardEvent,
} from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import Header from "@/components/common/Header/Header";
import styles from "./WritePage.module.css";
import { createLetter } from "@/apis/letter";

const MAX_LINES = 11;
const TOTAL_PAGES = 3;

export default function WritePage() {
  const { id: mailboxId } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [to, setTo] = useState(""); // 받는 사람
  const [from, setFrom] = useState(""); // 보내는 사람
  const [pages, setPages] = useState<string[]>(Array(TOTAL_PAGES).fill(""));
  const [currentPage, setCurrentPage] = useState(0);
  const [saving, setSaving] = useState(false);

  const pagerRef = useRef<HTMLDivElement | null>(null);
  const textRefs = useRef<(HTMLTextAreaElement | null)[]>(
    Array(TOTAL_PAGES).fill(null)
  );
  const mirrorRef = useRef<HTMLDivElement | null>(null);

  /** --------- 숨겨진 미러 div로 “보이는 줄 수” 계산 --------- */
  useEffect(() => {
    const el = document.createElement("div");
    el.style.position = "absolute";
    el.style.left = "-9999px";
    el.style.top = "0";
    el.style.whiteSpace = "pre-wrap";
    el.style.wordBreak = "break-word";
    el.style.visibility = "hidden";
    document.body.appendChild(el);
    mirrorRef.current = el;
    return () => {
      document.body.removeChild(el);
      mirrorRef.current = null;
    };
  }, []);

  const countVisualLines = (ta: HTMLTextAreaElement | null, text: string) => {
    if (!ta || !mirrorRef.current) return 1;
    const cs = getComputedStyle(ta);
    const m = mirrorRef.current;
    m.style.width = `${ta.clientWidth}px`;
    m.style.font = cs.font;
    m.style.lineHeight = cs.lineHeight;
    m.style.letterSpacing = cs.letterSpacing;
    m.style.padding = cs.padding;
    m.style.border = "0";
    m.style.boxSizing = "content-box";

    m.textContent = text.length ? text : " ";
    let lh = parseFloat(cs.lineHeight);
    if (isNaN(lh)) {
      const fs = parseFloat(cs.fontSize);
      lh = fs * 1.2;
    }
    return Math.ceil(m.scrollHeight / lh);
  };

  /** 안전하게 입력 세팅 */
  const setPageSafely = (idx: number, nextText: string) => {
    const ta = textRefs.current[idx];
    const visual = countVisualLines(ta, nextText);
    if (visual > MAX_LINES) return false;
    setPages((prev) => {
      const arr = [...prev];
      arr[idx] = nextText;
      return arr;
    });
    return true;
  };

  const onBodyChange =
    (idx: number) => (e: ChangeEvent<HTMLTextAreaElement>) => {
      const ok = setPageSafely(idx, e.target.value);
      if (!ok) e.target.value = pages[idx]; // 제한 초과 시 롤백
    };

  const onBodyKeyDown =
    (idx: number) => (e: KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter") {
        const ta = textRefs.current[idx];
        const visual = countVisualLines(ta, pages[idx]);
        if (visual >= MAX_LINES) e.preventDefault();
      }
    };

  /** 페이지 스크롤 → 현재 페이지 번호 계산 */
  useEffect(() => {
    const wrap = pagerRef.current;
    if (!wrap) return;
    const onScroll = () => {
      const w = wrap.clientWidth;
      const page = Math.round(wrap.scrollLeft / w);
      setCurrentPage(Math.max(0, Math.min(TOTAL_PAGES - 1, page)));
    };
    wrap.addEventListener("scroll", onScroll, { passive: true });
    return () => wrap.removeEventListener("scroll", onScroll);
  }, []);

  /** 저장 API */
  const handleSave = async () => {
    if (!mailboxId) {
      alert("편지함 정보가 없습니다.");
      return;
    }
    if (!title.trim()) {
      alert("제목을 입력해주세요.");
      return;
    }
    try {
      setSaving(true);
      const payload = {
        mailboxId,
        title: title.trim(),
        to: to.trim() || undefined,
        from: from.trim() || undefined,
        body: pages.join("\n\n---page-break---\n\n"), // 3페이지 합침
      };
      await createLetter(payload);
      navigate(`/mailboxes/${mailboxId}`);
    } catch (err) {
      console.error("저장 실패:", err);
      alert("저장에 실패했습니다.");
    } finally {
      setSaving(false);
    }
  };

  /** 저장 버튼 (모든 페이지 공통) */
  const SaveButton = useMemo(
    () => (
      <button type="button" onClick={handleSave} className={styles.saveBtn}>
        <img src="/icons/png.png" alt="저장" />
      </button>
    ),
    [title, to, from, pages, saving]
  );

  /** ref 등록 */
  const setTextRef = (i: number) => (el: HTMLTextAreaElement | null) => {
    textRefs.current[i] = el;
  };

  return (
    <>
      <Header title="편지쓰기" />
      <div className={styles.page}>
        <div className={styles.form}>
          {/* 제목 */}
          <label className={styles.inputBlock}>
            <input
              className={styles.titleInput}
              placeholder="편지 제목"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </label>

          {/* 스와이프 페이지 */}
          <div className={styles.pager} ref={pagerRef}>
            {Array.from({ length: TOTAL_PAGES }).map((_, idx) => (
              <section className={styles.paper} key={idx}>
                <div className={styles.paperInner}>
                  {/* 첫 페이지만 To */}
                  {idx === 0 && (
                    <div className={styles.row}>
                      <span className={styles.meta}>To.</span>
                      <input
                        className={styles.metaInput}
                        placeholder="받는 사람"
                        value={to}
                        onChange={(e) => setTo(e.target.value)}
                      />
                    </div>
                  )}

                  {/* 본문 */}
                  <textarea
                    ref={setTextRef(idx)}
                    className={styles.bodyArea}
                    value={pages[idx]}
                    onChange={onBodyChange(idx)}
                    onKeyDown={onBodyKeyDown(idx)}
                    placeholder="내용을 적어주세요…"
                  />

                  {/* 첫 페이지는 From + 저장, 나머지는 저장만 */}
                  {idx === 0 ? (
                    <div className={styles.rowBottom}>
                      <span className={styles.meta}>From.</span>
                      <input
                        className={styles.metaInput}
                        placeholder="보내는 사람"
                        value={from}
                        onChange={(e) => setFrom(e.target.value)}
                      />
                      {SaveButton}
                    </div>
                  ) : (
                    <div className={styles.rowBottomSpacer}>{SaveButton}</div>
                  )}
                </div>
              </section>
            ))}
          </div>

          {/* 하단 페이지 도트 */}
          <div className={styles.pageDots}>
            {Array.from({ length: TOTAL_PAGES }).map((_, i) => (
              <span
                key={i}
                className={`${styles.dot} ${
                  i === currentPage ? styles.dotActive : ""
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
