import { createWordBoundaryPreview } from "../content/createWordBoundaryPreview";
import type { Recognition } from "../content/models";
import styles from "./RecognitionCard.module.css";
import ResponsivePortfolioImage from "./ResponsivePortfolioImage";

type RecognitionCardProps = {
  readonly recognition: Recognition;
  readonly expanded: boolean;
  readonly onToggle: (recognitionId: string) => void;
};

export default function RecognitionCard({
  recognition,
  expanded,
  onToggle,
}: RecognitionCardProps) {
  const headingId = `${recognition.id}-recognition-heading`;
  const detailsId = `${recognition.id}-recognition-details`;
  const detailsAction = expanded
    ? "Hide Full Recognition"
    : "Read Full Recognition";
  const preview = createWordBoundaryPreview(recognition.description, 400);
  const isTruncated = preview !== recognition.description;

  return (
    <article
      aria-labelledby={headingId}
      className={styles.card}
      data-recognition-category={recognition.category}
      data-recognition-id={recognition.id}
    >
      <div className={styles.imageFrame}>
        <ResponsivePortfolioImage
          className={styles.image}
          image={recognition.image}
          loading="lazy"
          sizes="(max-width: 40rem) calc(100vw - 2rem), (max-width: 64rem) calc((100vw - 4rem) / 2), 24rem"
        />
      </div>

      <div className={styles.content}>
        <p className={styles.category}>{recognition.category}</p>
        <h3 className={styles.heading} id={headingId}>
          {recognition.title}
        </h3>

        {!isTruncated || !expanded ? (
          <p className={styles.preview} data-recognition-preview>
            {preview}
          </p>
        ) : null}

        <ul
          aria-label={`Recognition tags for ${recognition.title} (${recognition.id})`}
          className={styles.tags}
        >
          {recognition.tags.map((tag) => (
            <li className={styles.tag} key={tag}>
              {tag}
            </li>
          ))}
        </ul>

        {isTruncated ? (
          <>
            <button
              aria-controls={detailsId}
              aria-expanded={expanded}
              aria-label={`${detailsAction} for ${recognition.title} (${recognition.id})`}
              className={styles.detailsButton}
              onClick={() => onToggle(recognition.id)}
              type="button"
            >
              {detailsAction}
            </button>

            <p className={styles.details} hidden={!expanded} id={detailsId}>
              {recognition.description}
            </p>
          </>
        ) : null}
      </div>
    </article>
  );
}
