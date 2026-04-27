import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import styles from "./PostSlider.module.css";

export default function PostSlider({ items }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const handler = (e) => {
      if (e.key === "ArrowLeft") setIndex((i) => Math.max(0, i - 1));
      if (e.key === "ArrowRight") setIndex((i) => Math.min(items.length - 1, i + 1));
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [items.length]);

  if (!items || items.length === 0) return null;

  const current = items[index];
  const hasPrev = index > 0;
  const hasNext = index < items.length - 1;

  return (
    <div className={styles.wrap}>
      <div className={styles.card}>
        <div className={styles.stage}>
          <img src={current.url} alt={current.caption ?? ""} className={styles.image} />

          {items.length > 1 && (
            <>
              <button
                type="button"
                onClick={() => setIndex((i) => i - 1)}
                disabled={!hasPrev}
                className={`${styles.navBtn} ${styles.navPrev}`}
                aria-label="이전 이미지"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                type="button"
                onClick={() => setIndex((i) => i + 1)}
                disabled={!hasNext}
                className={`${styles.navBtn} ${styles.navNext}`}
                aria-label="다음 이미지"
              >
                <ChevronRight size={20} />
              </button>
            </>
          )}
        </div>

        {current.caption && (
          <div className={styles.caption}>
            <span className={styles.captionIndex}>
              {String(index + 1).padStart(2, "0")}
            </span>
            <span className={styles.captionText}>{current.caption}</span>
          </div>
        )}
      </div>

      {items.length > 1 && (
        <div className={styles.thumbStrip}>
          {items.map((item, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setIndex(i)}
              className={`${styles.thumb} ${i === index ? styles.thumbActive : ""}`}
              style={{ backgroundImage: `url(${item.url})` }}
              aria-label={`${i + 1}번째 이미지`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
