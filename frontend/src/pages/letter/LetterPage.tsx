import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Header from "@/components/common/Header/Header";
import styles from "./LetterPage.module.css";
import LetterCard from "@/components/LetterPage/LetterCard";
import Button from "@/components/common/button/Button";
import { getMailboxLetters, Letter } from "@/apis/letter";

export default function LetterPage() {
  const { id: mailboxId } = useParams<{ id: string }>();
  const nav = useNavigate();
  // TODO: id로 상세 불러오기

  const [letters, setLetters] = useState<Letter[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!mailboxId) return;
    // 첫 로드
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const { items, nextCursor } = await getMailboxLetters({
          mailboxId,
          limit: 20,
        });
        setLetters(items);
        setNextCursor(nextCursor);
      } catch (e: any) {
        setError("편지 목록을 불러오지 못했습니다.");
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, [mailboxId]);

  const loadMore = async () => {
    if (!mailboxId || !nextCursor || loading) return;
    try {
      setLoading(true);
      const { items, nextCursor: nc } = await getMailboxLetters({
        mailboxId,
        limit: 20,
        cursor: nextCursor,
      });
      setLetters((prev) => [...prev, ...items]);
      setNextCursor(nc);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const sortedLetters = useMemo(
    () => [...letters].sort((a, b) => (a.date < b.date ? 1 : -1)),
    [letters]
  );
  return (
    <>
      <Header title="편지함 제목" />
      <div className={styles.page}>
        <div className={styles.title}>
          <img src="/icons/mail_fill.svg" />
          <h1 className={styles.titleText}>저장된 편지</h1>
        </div>

        {error && <div className={styles.error}>{error}</div>}
        {loading && letters.length === 0 ? (
          <div className={styles.empty}>불러오는 중…</div>
        ) : sortedLetters.length === 0 ? (
          <div className={styles.empty}>아직 저장된 편지가 없어요.</div>
        ) : (
          <>
            <ul className={styles.list}>
              {sortedLetters.map((lt) => (
                <li key={lt.id} className={styles.item}>
                  <button
                    type="button"
                    className={styles.itemButton}
                    onClick={() => nav(`/letter/${mailboxId}/${lt.id}`)}
                    aria-label={`편지 상세 보기: ${lt.title}`}
                  >
                    <LetterCard title={lt.title} body={lt.body} date={lt.date} />
                  </button>
                </li>
              ))}
            </ul>
            {nextCursor && (
              <button
                className={styles.moreBtn}
                onClick={loadMore}
                disabled={loading}
              >
                {loading ? "불러오는 중…" : "더 보기"}
              </button>
            )}
          </>
        )}
      </div>
      <div className={styles.footer}>
        <Button
          className={styles.writeButton}
          onClick={() => nav(`/letter/${mailboxId}/write`)}
        >
          편지 쓰기
        </Button>
        <Button className={styles.exitButton} onClick={() => nav(-1)}>
          편지함 나가기
        </Button>
      </div>
    </>
  );
}
