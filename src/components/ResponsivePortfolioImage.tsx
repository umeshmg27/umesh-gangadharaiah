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

  if (image.kind === "remote") {
    return (
      <img
        alt={image.alt}
        className={imageClassName}
        decoding="async"
        height={image.height}
        loading={loading}
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
        src={image.fallbackSrc}
        width={image.width}
      />
    </picture>
  );
}
