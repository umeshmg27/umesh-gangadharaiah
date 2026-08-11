import {
  type FocusEvent,
  type MouseEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import type { Recognition, RecognitionCategory } from "../content/models";
import { sortRecognitionsNewestFirst } from "../content/recognitionDate";
import { recognitions } from "../content/recognitions";
import RecognitionCard from "./RecognitionCard";
import styles from "./RecognitionGallery.module.css";

type RecognitionFilter = "all" | RecognitionCategory;
type RecognitionView = "highlights" | RecognitionFilter;

type RecognitionState = {
  view: RecognitionView;
  expandedIds: ReadonlySet<string>;
};

type CarouselControls = {
  canScrollNext: boolean;
  canScrollPrevious: boolean;
};

type AutoplayPreference = "automatic" | "paused" | "playing";

type InteractionPauseState = {
  focusWithin: boolean;
  pointerWithin: boolean;
};

const recognitionRecords: readonly Recognition[] = recognitions;
const recognitionCategories = [
  "Innovation",
  "Mentorship",
  "Leadership",
] as const satisfies readonly RecognitionCategory[];
const highlightTrackId = "recognition-highlight-track";
const autoplayDelayMilliseconds = 6_000;
const initialCarouselControls: CarouselControls = {
  canScrollNext: false,
  canScrollPrevious: false,
};
const initialInteractionPauseState: InteractionPauseState = {
  focusWithin: false,
  pointerWithin: false,
};
const chronologicalRecognitions = sortRecognitionsNewestFirst(
  recognitionRecords,
);
const highlightedRecognitions = chronologicalRecognitions.slice(0, 6);
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
    ? chronologicalRecognitions
    : sortRecognitionsNewestFirst(
        recognitionRecords.filter(
          (recognition) => recognition.category === filter,
        ),
      );
}

function recognitionCountText(
  count: number,
  view: RecognitionView,
): string {
  if (view === "highlights")
    return `Showing ${count} recognition highlights.`;
  if (view === "all") return `Showing all ${count} recognitions.`;
  return `Showing ${count} ${view} recognitions.`;
}

export default function RecognitionGallery() {
  const [state, setState] = useState<RecognitionState>(() => ({
    view: "highlights",
    expandedIds: new Set<string>(),
  }));
  const highlightTrackRef = useRef<HTMLDivElement>(null);
  const highlightCarouselRef = useRef<HTMLDivElement>(null);
  const recognitionResultsRef = useRef<HTMLDivElement>(null);
  const [carouselControls, setCarouselControls] =
    useState<CarouselControls>(initialCarouselControls);
  const [autoplayPreference, setAutoplayPreference] =
    useState<AutoplayPreference>("automatic");
  const [interactionPause, setInteractionPause] =
    useState<InteractionPauseState>(initialInteractionPauseState);
  const [pageVisible, setPageVisible] = useState(
    () =>
      typeof document === "undefined" ||
      document.visibilityState !== "hidden",
  );
  const [carouselInViewport, setCarouselInViewport] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(
    () =>
      typeof window !== "undefined" &&
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
  const highlightsVisible = state.view === "highlights";
  const visibleRecognitions = state.view === "highlights"
    ? highlightedRecognitions
    : filterRecognitions(state.view);
  const autoplayRequested =
    autoplayPreference === "playing" ||
    (autoplayPreference === "automatic" && !prefersReducedMotion);
  const autoplayPausedForInteraction =
    interactionPause.focusWithin || interactionPause.pointerWithin;
  const autoplayActive =
    autoplayRequested &&
    !autoplayPausedForInteraction &&
    pageVisible &&
    carouselInViewport &&
    highlightsVisible;

  const updateCarouselControls = useCallback((): void => {
    const track = highlightTrackRef.current;

    if (!track) return;

    const maximumScrollLeft = Math.max(
      0,
      track.scrollWidth - track.clientWidth,
    );
    const boundaryTolerance = 1;
    const nextControls = {
      canScrollNext:
        track.scrollLeft < maximumScrollLeft - boundaryTolerance,
      canScrollPrevious: track.scrollLeft > boundaryTolerance,
    };

    setCarouselControls((current) =>
      current.canScrollNext === nextControls.canScrollNext &&
      current.canScrollPrevious === nextControls.canScrollPrevious
        ? current
        : nextControls,
    );
  }, []);

  useEffect(() => {
    if (!highlightsVisible) return;

    const track = highlightTrackRef.current;

    if (!track) return;

    updateCarouselControls();

    const resizeObserver = new ResizeObserver(updateCarouselControls);
    resizeObserver.observe(track);

    return () => resizeObserver.disconnect();
  }, [highlightsVisible, updateCarouselControls]);

  useEffect(() => {
    if (!highlightsVisible) return;

    const carousel = highlightCarouselRef.current;

    if (!carousel) return;

    const intersectionObserver = new IntersectionObserver(([entry]) => {
      setCarouselInViewport(entry?.isIntersecting === true);
    });
    intersectionObserver.observe(carousel);

    return () => intersectionObserver.disconnect();
  }, [highlightsVisible]);

  useEffect(() => {
    if (typeof window.matchMedia !== "function") return;

    const reducedMotionQuery = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    );
    const updateMotionPreference = (): void => {
      setPrefersReducedMotion(reducedMotionQuery.matches);
    };

    if (typeof reducedMotionQuery.addEventListener === "function") {
      reducedMotionQuery.addEventListener("change", updateMotionPreference);
      return () =>
        reducedMotionQuery.removeEventListener(
          "change",
          updateMotionPreference,
        );
    }

    reducedMotionQuery.addListener?.(updateMotionPreference);
    return () => reducedMotionQuery.removeListener?.(updateMotionPreference);
  }, []);

  useEffect(() => {
    const updatePageVisibility = (): void => {
      setPageVisible(document.visibilityState !== "hidden");
    };

    document.addEventListener("visibilitychange", updatePageVisibility);
    return () =>
      document.removeEventListener("visibilitychange", updatePageVisibility);
  }, []);

  const advanceAutoplay = useCallback((): void => {
    const track = highlightTrackRef.current;

    if (!track) return;

    const maximumScrollLeft = Math.max(
      0,
      track.scrollWidth - track.clientWidth,
    );

    if (maximumScrollLeft <= 1) return;

    const remainingDistance = maximumScrollLeft - track.scrollLeft;
    const left =
      remainingDistance > 1
        ? Math.min(track.clientWidth, remainingDistance)
        : -track.scrollLeft;

    track.scrollBy({
      behavior: prefersReducedMotion ? "auto" : "smooth",
      left,
    });
  }, [prefersReducedMotion]);

  useEffect(() => {
    if (!autoplayActive) return;

    let timeoutId: number | undefined;

    const scheduleNextAdvance = (): void => {
      timeoutId = window.setTimeout(() => {
        advanceAutoplay();
        scheduleNextAdvance();
      }, autoplayDelayMilliseconds);
    };

    scheduleNextAdvance();

    return () => {
      if (timeoutId !== undefined) window.clearTimeout(timeoutId);
    };
  }, [advanceAutoplay, autoplayActive]);

  function updateView(
    event: MouseEvent<HTMLButtonElement>,
    view: RecognitionView,
  ): void {
    if (recognitionResultsRef.current?.contains(document.activeElement)) {
      event.currentTarget.focus();
    }

    if (view !== "highlights") {
      setCarouselInViewport(false);
      setInteractionPause(initialInteractionPauseState);
    }
    setState((current) => ({ ...current, view }));
  }

  function toggleDetails(recognitionId: string): void {
    setState((current) => {
      const expandedIds = new Set(current.expandedIds);

      if (expandedIds.has(recognitionId)) expandedIds.delete(recognitionId);
      else expandedIds.add(recognitionId);

      return { ...current, expandedIds };
    });
  }

  function scrollHighlights(direction: -1 | 1): void {
    const track = highlightTrackRef.current;

    if (
      !track ||
      (direction < 0 && !carouselControls.canScrollPrevious) ||
      (direction > 0 && !carouselControls.canScrollNext)
    ) {
      return;
    }

    track.scrollBy({
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "auto"
        : "smooth",
      left: direction * track.clientWidth,
    });
  }

  function toggleAutoplay(): void {
    setAutoplayPreference(autoplayRequested ? "paused" : "playing");
  }

  function updateInteractionPause(
    update: Partial<InteractionPauseState>,
  ): void {
    setInteractionPause((current) => ({ ...current, ...update }));
  }

  function handleCarouselBlur(event: FocusEvent<HTMLDivElement>): void {
    const nextFocusedElement = event.relatedTarget;

    if (
      nextFocusedElement instanceof Node &&
      event.currentTarget.contains(nextFocusedElement)
    ) {
      return;
    }

    updateInteractionPause({ focusWithin: false });
  }

  const cards = visibleRecognitions.map((recognition) => (
    <RecognitionCard
      expanded={state.expandedIds.has(recognition.id)}
      key={recognition.id}
      onToggle={toggleDetails}
      recognition={recognition}
    />
  ));

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
      </div>

      <div
        aria-label="Choose recognition view"
        className={styles.viewSelector}
        role="group"
      >
        <button
          aria-controls="recognition-results"
          aria-pressed={state.view === "highlights"}
          className={styles.viewButton}
          onClick={(event) => updateView(event, "highlights")}
          type="button"
        >
          Highlights ({highlightedRecognitions.length})
        </button>
        {recognitionCategories.map((category) => (
          <button
            aria-controls="recognition-results"
            aria-pressed={state.view === category}
            className={styles.viewButton}
            key={category}
            onClick={(event) => updateView(event, category)}
            type="button"
          >
            {category} ({categoryCounts[category]})
          </button>
        ))}
        <button
          aria-controls="recognition-results"
          aria-pressed={state.view === "all"}
          className={styles.viewButton}
          onClick={(event) => updateView(event, "all")}
          type="button"
        >
          All ({recognitionRecords.length})
        </button>
      </div>

      <p className={styles.resultCount}>
        {recognitionCountText(visibleRecognitions.length, state.view)}
      </p>

      <div id="recognition-results" ref={recognitionResultsRef}>
        {highlightsVisible ? (
          <div
            aria-label="Recognition highlights carousel"
            aria-roledescription="carousel"
            className={styles.highlightCarousel}
            onBlurCapture={handleCarouselBlur}
            onFocusCapture={() =>
              updateInteractionPause({ focusWithin: true })
            }
            onPointerEnter={() =>
              updateInteractionPause({ pointerWithin: true })
            }
            onPointerLeave={() =>
              updateInteractionPause({ pointerWithin: false })
            }
            ref={highlightCarouselRef}
            role="region"
          >
            <div className={styles.carouselControls}>
              <button
                aria-controls={highlightTrackId}
                aria-label={
                  autoplayRequested
                    ? "Pause recognition highlights autoplay"
                    : "Play recognition highlights autoplay"
                }
                className={`${styles.carouselControl} ${styles.autoplayControl}`}
                onClick={toggleAutoplay}
                type="button"
              >
                {autoplayRequested ? "Pause autoplay" : "Play autoplay"}
              </button>

              <div className={styles.navigationControls}>
                <button
                  aria-controls={highlightTrackId}
                  aria-disabled={!carouselControls.canScrollPrevious}
                  aria-label="Previous recognition highlight"
                  className={styles.carouselControl}
                  onClick={() => scrollHighlights(-1)}
                  type="button"
                >
                  Previous
                </button>
                <button
                  aria-controls={highlightTrackId}
                  aria-disabled={!carouselControls.canScrollNext}
                  aria-label="Next recognition highlight"
                  className={styles.carouselControl}
                  onClick={() => scrollHighlights(1)}
                  type="button"
                >
                  Next
                </button>
              </div>
            </div>

            <div
              aria-label="Scrollable recognition highlights"
              className={styles.highlightTrack}
              data-contained-horizontal-scroll=""
              id={highlightTrackId}
              onScroll={updateCarouselControls}
              ref={highlightTrackRef}
            >
              {cards}
            </div>
          </div>
        ) : (
          <div className={styles.grid}>{cards}</div>
        )}
      </div>
    </section>
  );
}
