import { type MouseEvent, useRef, useState } from "react";

import type { Recognition, RecognitionCategory } from "../content/models";
import { recognitions } from "../content/recognitions";
import RecognitionCard from "./RecognitionCard";
import styles from "./RecognitionGallery.module.css";

type RecognitionFilter = "all" | RecognitionCategory;

type RecognitionState = {
  archiveOpen: boolean;
  filter: RecognitionFilter;
  expandedIds: ReadonlySet<string>;
};

const recognitionRecords: readonly Recognition[] = recognitions;
const recognitionCategories = [
  "Innovation",
  "Mentorship",
  "Leadership",
] as const satisfies readonly RecognitionCategory[];
const highlightedRecognitions = recognitionRecords
  .filter((recognition) => recognition.highlightOrder !== undefined)
  .sort(
    (left, right) =>
      (left.highlightOrder ?? Number.POSITIVE_INFINITY) -
      (right.highlightOrder ?? Number.POSITIVE_INFINITY),
  );
const categoryCounts = Object.fromEntries(
  recognitionCategories.map((category) => [
    category,
    recognitionRecords.filter(
      (recognition) => recognition.category === category,
    ).length,
  ]),
) as Record<RecognitionCategory, number>;

function filterRecognitions(
  filter: RecognitionFilter,
): readonly Recognition[] {
  return filter === "all"
    ? recognitionRecords
    : recognitionRecords.filter(
        (recognition) => recognition.category === filter,
      );
}

function recognitionCountText(
  count: number,
  archiveOpen: boolean,
  filter: RecognitionFilter,
): string {
  if (!archiveOpen) return `Showing ${count} recognition highlights.`;
  if (filter === "all") return `Showing all ${count} recognitions.`;
  return `Showing ${count} ${filter} recognitions.`;
}

export default function RecognitionGallery() {
  const [state, setState] = useState<RecognitionState>(() => ({
    archiveOpen: false,
    filter: "all",
    expandedIds: new Set<string>(),
  }));
  const archiveControlRef = useRef<HTMLButtonElement>(null);
  const visibleRecognitions = state.archiveOpen
    ? filterRecognitions(state.filter)
    : highlightedRecognitions;

  function toggleArchive(): void {
    if (state.archiveOpen) archiveControlRef.current?.focus();

    setState((current) => ({
      ...current,
      archiveOpen: !current.archiveOpen,
      filter: "all",
    }));
  }

  function updateFilter(
    event: MouseEvent<HTMLButtonElement>,
    filter: RecognitionFilter,
  ): void {
    const activeCard = document.activeElement?.closest<HTMLElement>(
      "[data-recognition-id]",
    );
    const nextIds = new Set(
      filterRecognitions(filter).map((recognition) => recognition.id),
    );

    if (
      activeCard?.dataset.recognitionId &&
      !nextIds.has(activeCard.dataset.recognitionId)
    ) {
      event.currentTarget.focus();
    }

    setState((current) => ({ ...current, filter }));
  }

  function toggleDetails(recognitionId: string): void {
    setState((current) => {
      const expandedIds = new Set(current.expandedIds);

      if (expandedIds.has(recognitionId)) expandedIds.delete(recognitionId);
      else expandedIds.add(recognitionId);

      return { ...current, expandedIds };
    });
  }

  return (
    <section
      aria-labelledby="recognition-heading"
      className={styles.section}
      id="recognition"
    >
      <div className={styles.sectionHeader}>
        <div>
          <p className={styles.eyebrow}>Peer impact</p>
          <h2 className={styles.heading} id="recognition-heading">
            Recognition
          </h2>
        </div>

        <button
          aria-controls="recognition-results"
          aria-expanded={state.archiveOpen}
          className={styles.archiveControl}
          onClick={toggleArchive}
          ref={archiveControlRef}
          type="button"
        >
          {state.archiveOpen
            ? "Show recognition highlights"
            : `View all ${recognitionRecords.length} recognitions`}
        </button>
      </div>

      {state.archiveOpen ? (
        <div
          aria-label="Filter recognitions by category"
          className={styles.filters}
          role="group"
        >
          <button
            aria-pressed={state.filter === "all"}
            className={styles.filterButton}
            onClick={(event) => updateFilter(event, "all")}
            type="button"
          >
            All ({recognitionRecords.length})
          </button>
          {recognitionCategories.map((category) => (
            <button
              aria-pressed={state.filter === category}
              className={styles.filterButton}
              key={category}
              onClick={(event) => updateFilter(event, category)}
              type="button"
            >
              {category} ({categoryCounts[category]})
            </button>
          ))}
        </div>
      ) : null}

      <p className={styles.resultCount}>
        {recognitionCountText(
          visibleRecognitions.length,
          state.archiveOpen,
          state.filter,
        )}
      </p>

      <div id="recognition-results">
        <div className={styles.grid}>
          {visibleRecognitions.map((recognition) => (
            <RecognitionCard
              expanded={state.expandedIds.has(recognition.id)}
              key={recognition.id}
              onToggle={toggleDetails}
              recognition={recognition}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
