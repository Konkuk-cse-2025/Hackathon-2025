import styles from "./Header.module.css";

type HeaderMode = "auto" | "textOnly" | "imageOnly" | "both";

type HeaderProps = {
  title?: string;
  imageSrc?: string;
  alt?: string;
  /** 표시 모드: 
   *  - auto: title과 imageSrc 유무로 자동 결정
   *  - textOnly: 텍스트만
   *  - imageOnly: 이미지만 (제목 숨김)
   *  - both: 둘 다
   */
  mode?: HeaderMode;
  /** 이미지 크기 제어 (px). 둘 중 하나만 주면 비율 유지 */
  imageWidth?: number;
  imageHeight?: number;
};

export default function Header({
  title = "",
  imageSrc,
  alt,
  mode = "auto",
  imageWidth = 32,
  imageHeight,
}: HeaderProps) {
  // 모드 자동결정
  const resolvedMode: HeaderMode =
    mode !== "auto"
      ? mode
      : imageSrc && !title
      ? "imageOnly"
      : imageSrc && title
      ? "both"
      : "textOnly";

  return (
    <header className={styles.header}>
      {/* 이미지: 절대배치라 헤더 높이에 영향 없음 */}
      {imageSrc && (
        <img
          src={imageSrc}
          alt={alt || ""}
          aria-hidden={!alt}
          className={
            resolvedMode === "imageOnly"
              ? `${styles.headerImage} ${styles.centerImage}`
              : `${styles.headerImage} ${styles.leftImage}`
          }
          style={{
            width: imageWidth ? `${imageWidth}px` : undefined,
            height: imageHeight ? `${imageHeight}px` : undefined,
          }}
        />
      )}

      {/* 텍스트: imageOnly 모드에서는 숨김 */}
      {resolvedMode !== "imageOnly" && title && (
        <span className={styles.headerText}>{title}</span>
      )}
    </header>
  );
}
