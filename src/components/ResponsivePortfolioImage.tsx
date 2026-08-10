import { useState } from "react";

import type { ImageAsset } from "../content/models";
import styles from "./ResponsivePortfolioImage.module.css";

type ResponsivePortfolioImageProps = {
  readonly image: ImageAsset;
  readonly loading?: "eager" | "lazy";
  readonly className?: string;
  readonly sizes?: string;
};

export default function ResponsivePortfolioImage({
  image,
  loading = "lazy",
  className,
  sizes = "100vw",
}: ResponsivePortfolioImageProps) {
  const imageClassName = [styles.image, className].filter(Boolean).join(" ");
  const imageKey =
    image.kind === "remote"
      ? [image.kind, image.src, image.alt, image.width, image.height].join("|")
      : [
          image.kind,
          image.fallbackSrc,
          image.alt,
          image.width,
          image.height,
          ...image.sources.map(({ src, width, type }) => `${src}|${width}|${type}`),
        ].join("|");
  const [failedImageKey, setFailedImageKey] = useState<string | null>(null);

  if (failedImageKey === imageKey) {
    return (
      <span
        aria-label={image.alt}
        className={[styles.fallback, className].filter(Boolean).join(" ")}
        data-image-fallback=""
        role="img"
        style={{ aspectRatio: `${image.width} / ${image.height}` }}
      >
        <span className={styles.fallbackStatus}>Image unavailable</span>
        <span className={styles.fallbackAlt}>{image.alt}</span>
      </span>
    );
  }

  if (image.kind === "remote") {
    return (
      <img
        alt={image.alt}
        className={imageClassName}
        decoding="async"
        height={image.height}
        loading={loading}
        onError={() => setFailedImageKey(imageKey)}
        src={image.src}
        width={image.width}
      />
    );
  }

  return (
    <picture className={styles.picture}>
      {image.sources.length > 0 ? (
        <source
          sizes={sizes}
          srcSet={image.sources
            .map((source) => `${source.src} ${source.width}w`)
            .join(", ")}
          type="image/webp"
        />
      ) : null}
      <img
        alt={image.alt}
        className={imageClassName}
        decoding="async"
        height={image.height}
        loading={loading}
        onError={() => setFailedImageKey(imageKey)}
        src={image.fallbackSrc}
        width={image.width}
      />
    </picture>
  );
}
