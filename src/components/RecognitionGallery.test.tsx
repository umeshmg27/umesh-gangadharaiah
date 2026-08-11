import {
  act,
  fireEvent,
  render,
  screen,
  within,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, vi } from "vitest";

import { createWordBoundaryPreview } from "../content/createWordBoundaryPreview";
import type { Recognition, RecognitionCategory } from "../content/models";
import { recognitions } from "../content/recognitions";
import RecognitionGallery from "./RecognitionGallery";
import recognitionGalleryCss from "./RecognitionGallery.module.css?raw";

const recognitionRecords: readonly Recognition[] = recognitions;
const categories = ["Innovation", "Mentorship", "Leadership"] as const;
const categoryCounts = {
  Innovation: 14,
  Mentorship: 5,
  Leadership: 6,
} as const satisfies Record<RecognitionCategory, number>;
const chronologicalIds = [
  "damo-211224",
  "priyanka-181224",
  "alfan-141124",
  "srid-181024",
  "rohi-171024",
  "atul-180724",
  "rohi-110624",
  "srid-010424",
  "rohi-100324",
  "maru-181023",
  "ara-290923",
  "rohi-270923",
  "moulie-120723",
  "mou-120723",
  "pal-050723",
  "ara-020723",
  "rohi-030523",
  "pra-080323",
  "rohi-240123",
  "ash-290922",
  "ana-230922",
  "pra-140622",
  "mad-260522",
  "mad-230422",
  "yogi-070422",
] as const;
const highlightIds = chronologicalIds.slice(0, 6);
const chronologicalCategoryIds = {
  Innovation: [
    "alfan-141124",
    "atul-180724",
    "rohi-270923",
    "mou-120723",
    "pal-050723",
    "ara-020723",
    "rohi-030523",
    "rohi-240123",
    "ash-290922",
    "ana-230922",
    "pra-140622",
    "mad-260522",
    "mad-230422",
    "yogi-070422",
  ],
  Mentorship: [
    "priyanka-181224",
    "srid-181024",
    "maru-181023",
    "moulie-120723",
    "pra-080323",
  ],
  Leadership: [
    "damo-211224",
    "rohi-171024",
    "rohi-110624",
    "srid-010424",
    "rohi-100324",
    "ara-290923",
  ],
} as const satisfies Record<RecognitionCategory, readonly string[]>;
const truncatedRecognitionRecords = recognitionRecords.filter(
  (recognition) =>
    createWordBoundaryPreview(recognition.description, 400) !==
    recognition.description,
);
const completeRecognitionRecords = recognitionRecords.filter(
  (recognition) =>
    createWordBoundaryPreview(recognition.description, 400) ===
    recognition.description,
);
const autoplayDelayMilliseconds = 6_000;
let intersectionObservers: ControllableIntersectionObserver[] = [];

class ControllableIntersectionObserver {
  readonly root = null;
  readonly rootMargin = "0px";
  readonly thresholds = [0];
  readonly targets = new Set<Element>();
  readonly disconnect = vi.fn(() => this.targets.clear());
  readonly observe = vi.fn((target: Element) => this.targets.add(target));
  readonly takeRecords = vi.fn(() => [] as IntersectionObserverEntry[]);
  readonly unobserve = vi.fn((target: Element) => this.targets.delete(target));

  constructor(
    private readonly callback: IntersectionObserverCallback,
  ) {
    intersectionObservers.push(this);
  }

  trigger(isIntersecting: boolean): void {
    const entries = Array.from(this.targets, (target) => ({
      boundingClientRect: target.getBoundingClientRect(),
      intersectionRatio: isIntersecting ? 1 : 0,
      intersectionRect: target.getBoundingClientRect(),
      isIntersecting,
      rootBounds: null,
      target,
      time: 0,
    })) as IntersectionObserverEntry[];

    this.callback(entries, this as unknown as IntersectionObserver);
  }
}

function setReducedMotion(matches: boolean): void {
  Object.defineProperty(window, "matchMedia", {
    configurable: true,
    value: vi.fn((query: string) => ({
      addEventListener: vi.fn(),
      addListener: vi.fn(),
      dispatchEvent: vi.fn(),
      matches,
      media: query,
      onchange: null,
      removeEventListener: vi.fn(),
      removeListener: vi.fn(),
    })),
  });
}

beforeEach(() => {
  intersectionObservers = [];
  vi.stubGlobal("IntersectionObserver", ControllableIntersectionObserver);
  setReducedMotion(false);
});

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

function renderGallery() {
  const user = userEvent.setup();
  render(<RecognitionGallery />);

  return {
    gallery: screen.getByRole("region", { name: "Recognition" }),
    user,
  };
}

function recognitionCards(gallery: HTMLElement): HTMLElement[] {
  return within(gallery).queryAllByRole("article");
}

function recognitionIds(gallery: HTMLElement): (string | undefined)[] {
  return recognitionCards(gallery).map((card) => card.dataset.recognitionId);
}

function recognitionCard(gallery: HTMLElement, id: string): HTMLElement {
  const card = gallery.querySelector<HTMLElement>(
    `[data-recognition-id="${id}"]`,
  );

  if (!card) throw new Error(`Missing recognition card for ${id}`);
  return card;
}

function recognitionHighlightTrack(gallery: HTMLElement): HTMLElement {
  return within(gallery).getByLabelText("Scrollable recognition highlights");
}

function setLatestCarouselIntersection(isIntersecting: boolean): void {
  const observer = intersectionObservers.at(-1);

  if (!observer) throw new Error("Missing carousel IntersectionObserver");
  act(() => observer.trigger(isIntersecting));
}

function recognitionIsoDate(id: string): string {
  const dateSuffix = id.match(/-(\d{2})(\d{2})(\d{2})$/);

  if (!dateSuffix) throw new Error(`Missing recognition date in ${id}`);
  return `20${dateSuffix[3]}-${dateSuffix[2]}-${dateSuffix[1]}`;
}

function configureHorizontalScroll(
  track: HTMLElement,
  { clientWidth, scrollWidth }: { clientWidth: number; scrollWidth: number },
) {
  Object.defineProperties(track, {
    clientWidth: { configurable: true, value: clientWidth },
    scrollWidth: { configurable: true, value: scrollWidth },
  });

  function setScrollLeft(scrollLeft: number): void {
    track.scrollLeft = scrollLeft;
    fireEvent.scroll(track);
  }

  const scrollBy = vi.fn((options: ScrollToOptions) => {
    const left = typeof options.left === "number" ? options.left : 0;
    const maximumScrollLeft = Math.max(0, scrollWidth - clientWidth);
    setScrollLeft(
      Math.max(0, Math.min(maximumScrollLeft, track.scrollLeft + left)),
    );
  });
  Object.defineProperty(track, "scrollBy", {
    configurable: true,
    value: scrollBy,
  });

  return { scrollBy, setScrollLeft };
}

function expectOrdinaryCount(gallery: HTMLElement, text: string): void {
  const count = within(gallery).getByText(text);

  expect(count.tagName).toBe("P");
  expect(count).not.toHaveAttribute("aria-live");
  expect(count).not.toHaveAttribute("role");
  expect(within(gallery).queryByRole("status")).not.toBeInTheDocument();
}

describe("RecognitionGallery", () => {
  it("leads with the six newest highlights and an immediate view selector", () => {
    const { gallery } = renderGallery();

    expect(
      within(gallery).getByRole("heading", {
        level: 2,
        name: "Recognition",
      }),
    ).toBeInTheDocument();
    expect(highlightIds).toEqual([
      "damo-211224",
      "priyanka-181224",
      "alfan-141124",
      "srid-181024",
      "rohi-171024",
      "atul-180724",
    ]);
    expect(recognitionIds(gallery)).toEqual(highlightIds);
    const viewSelector = within(gallery).getByRole("group", {
      name: "Choose recognition view",
    });
    const expectedViews = [
      "Highlights (6)",
      "Innovation (14)",
      "Mentorship (5)",
      "Leadership (6)",
      "All (25)",
    ];

    expect(
      within(viewSelector)
        .getAllByRole("button")
        .map((button) => button.textContent),
    ).toEqual(expectedViews);
    expect(
      within(viewSelector).getByRole("button", { name: "Highlights (6)" }),
    ).toHaveAttribute("aria-pressed", "true");

    for (const viewName of expectedViews.slice(1)) {
      expect(
        within(viewSelector).getByRole("button", { name: viewName }),
      ).toHaveAttribute("aria-pressed", "false");
    }

    expectOrdinaryCount(gallery, "Showing 6 recognition highlights.");
  });

  it("scrolls the highlighted track with visible boundary-aware controls", async () => {
    const { gallery, user } = renderGallery();
    const carousel = within(gallery).getByRole("region", {
      name: "Recognition highlights carousel",
    });
    const track = recognitionHighlightTrack(gallery);
    const previous = within(carousel).getByRole("button", {
      name: "Previous recognition highlight",
    });
    const next = within(carousel).getByRole("button", {
      name: "Next recognition highlight",
    });
    const { scrollBy, setScrollLeft } = configureHorizontalScroll(track, {
      clientWidth: 320,
      scrollWidth: 960,
    });

    setScrollLeft(0);

    expect(carousel).toHaveAttribute("aria-roledescription", "carousel");
    expect(track).toHaveAttribute("data-contained-horizontal-scroll", "");
    expect(previous).toHaveAttribute("aria-controls", track.id);
    expect(next).toHaveAttribute("aria-controls", track.id);
    expect(previous).toBeVisible();
    expect(next).toBeVisible();
    expect(previous).toHaveAttribute("aria-disabled", "true");
    expect(next).toHaveAttribute("aria-disabled", "false");

    await user.click(next);

    expect(scrollBy).toHaveBeenLastCalledWith({
      behavior: "smooth",
      left: 320,
    });
    expect(previous).toHaveAttribute("aria-disabled", "false");
    expect(next).toHaveAttribute("aria-disabled", "false");

    setScrollLeft(640);
    expect(previous).toHaveAttribute("aria-disabled", "false");
    expect(next).toHaveAttribute("aria-disabled", "true");

    const callsAtEnd = scrollBy.mock.calls.length;
    await user.click(next);
    expect(next).toHaveFocus();
    expect(scrollBy).toHaveBeenCalledTimes(callsAtEnd);

    await user.click(previous);
    expect(scrollBy).toHaveBeenLastCalledWith({
      behavior: "smooth",
      left: -320,
    });
    expect(previous).toHaveAttribute("aria-disabled", "false");
    expect(next).toHaveAttribute("aria-disabled", "false");

    await user.click(previous);
    expect(previous).toHaveAttribute("aria-disabled", "true");
    expect(next).toHaveAttribute("aria-disabled", "false");

    expect(recognitionGalleryCss).toMatch(/overflow-x:\s*auto/);
    expect(recognitionGalleryCss).toMatch(/scroll-snap-type:\s*x mandatory/);
    expect(recognitionGalleryCss).toMatch(/scroll-snap-align:\s*start/);
  });

  it("shows all twenty-five recognitions directly with exact selector counts", async () => {
    const { gallery, user } = renderGallery();

    await user.click(
      within(gallery).getByRole("button", {
        name: "All (25)",
      }),
    );

    expect(recognitionIds(gallery)).toEqual(chronologicalIds);
    expectOrdinaryCount(gallery, "Showing all 25 recognitions.");

    const viewSelector = within(gallery).getByRole("group", {
      name: "Choose recognition view",
    });
    expect(
      within(viewSelector).getByRole("button", { name: "All (25)" }),
    ).toHaveAttribute("aria-pressed", "true");

    for (const category of categories) {
      expect(
        within(viewSelector).getByRole("button", {
          name: `${category} (${categoryCounts[category]})`,
        }),
      ).toHaveAttribute("aria-pressed", "false");
      expect(
        recognitionRecords.filter(
          (recognition) => recognition.category === category,
        ),
      ).toHaveLength(categoryCounts[category]);
    }
  });

  it("switches directly to each category in newest-first order", async () => {
    const { gallery, user } = renderGallery();

    for (const category of categories) {
      const filter = within(gallery).getByRole("button", {
        name: `${category} (${categoryCounts[category]})`,
      });
      await user.click(filter);

      expect(filter).toHaveAttribute("aria-pressed", "true");
      expect(
        within(gallery).getByRole("button", { name: "All (25)" }),
      ).toHaveAttribute("aria-pressed", "false");
      expect(recognitionIds(gallery)).toEqual(
        chronologicalCategoryIds[category],
      );
      expectOrdinaryCount(
        gallery,
        `Showing ${categoryCounts[category]} ${category} recognitions.`,
      );
    }

    await user.click(
      within(gallery).getByRole("button", { name: "All (25)" }),
    );
    expect(recognitionIds(gallery)).toEqual(chronologicalIds);
  });

  it("renders stable semantic cards without changing copy, categories, tags, or image metadata", async () => {
    const { gallery, user } = renderGallery();

    await user.click(
      within(gallery).getByRole("button", {
        name: "All (25)",
      }),
    );

    for (const recognition of recognitionRecords) {
      const card = recognitionCard(gallery, recognition.id);
      const heading = within(card).getByRole("heading", {
        level: 3,
        name: recognition.title,
      });
      const category = within(card).getByText(recognition.category, {
        selector: "p",
      });
      const tags = within(card).getByRole("list", {
        name: `Recognition tags for ${recognition.title} (${recognition.id})`,
      });
      const image = within(card).getByRole("img", {
        name: recognition.image.alt,
      });
      const date = card.querySelector("time");

      expect(card).toHaveAttribute("data-recognition-id", recognition.id);
      expect(card).toHaveAttribute(
        "data-recognition-category",
        recognition.category,
      );
      expect(card).toHaveAttribute(
        "aria-labelledby",
        `${recognition.id}-recognition-heading`,
      );
      expect(heading).toHaveAttribute(
        "id",
        `${recognition.id}-recognition-heading`,
      );
      expect(category.textContent).toBe(recognition.category);
      expect(date).toHaveAttribute("datetime", recognitionIsoDate(recognition.id));
      expect(date).toHaveTextContent(/^\d{1,2} [A-Z][a-z]+ 20\d{2}$/);
      expect(
        within(tags).getAllByRole("listitem").map((item) => item.textContent),
      ).toEqual(recognition.tags);
      expect(image.closest("picture")).not.toBeNull();
      expect(image).toHaveAttribute("loading", "lazy");
      expect(image).toHaveAttribute("decoding", "async");
      expect(image).toHaveAttribute("width", String(recognition.image.width));
      expect(image).toHaveAttribute(
        "height",
        String(recognition.image.height),
      );
    }
  });

  it("limits unique controlled disclosures to genuinely truncated records", async () => {
    const { gallery, user } = renderGallery();

    await user.click(
      within(gallery).getByRole("button", {
        name: "All (25)",
      }),
    );

    const readNames = truncatedRecognitionRecords.map((recognition) => {
      const card = recognitionCard(gallery, recognition.id);
      const button = within(card).getByRole("button", {
        name: `Read Full Recognition for ${recognition.title} (${recognition.id})`,
      });
      const detailsId = button.getAttribute("aria-controls");
      const details = document.getElementById(detailsId ?? "");
      const preview = card.querySelector<HTMLElement>(
        "[data-recognition-preview]",
      );

      expect(preview?.textContent).toBe(
        createWordBoundaryPreview(recognition.description, 400),
      );
      expect(detailsId).toBe(`${recognition.id}-recognition-details`);
      expect(button).toHaveAttribute("aria-expanded", "false");
      expect(button).toHaveTextContent(/^Read Full Recognition$/);
      expect(details?.textContent).toBe(recognition.description);
      expect(details).not.toBeVisible();
      return button.getAttribute("aria-label");
    });

    expect(
      within(gallery).getAllByRole("button", {
        name: /^Read Full Recognition for /,
      }),
    ).toHaveLength(truncatedRecognitionRecords.length);
    expect(new Set(readNames).size).toBe(truncatedRecognitionRecords.length);

    for (const recognition of truncatedRecognitionRecords) {
      const card = recognitionCard(gallery, recognition.id);
      const button = within(card).getByRole("button", {
        name: `Read Full Recognition for ${recognition.title} (${recognition.id})`,
      });

      await user.click(button);

      const details = document.getElementById(
        `${recognition.id}-recognition-details`,
      );
      expect(button).toHaveAccessibleName(
        `Hide Full Recognition for ${recognition.title} (${recognition.id})`,
      );
      expect(button).toHaveAttribute("aria-expanded", "true");
      expect(card.querySelector("[data-recognition-preview]")).toBeNull();
      expect(details).toBeVisible();
      expect(details?.textContent).toBe(recognition.description);
      expect(
        Array.from(card.querySelectorAll("p")).filter(
          (paragraph) => paragraph.textContent === recognition.description,
        ),
      ).toHaveLength(1);
    }

    const hideNames = within(gallery)
      .getAllByRole("button", { name: /^Hide Full Recognition for / })
      .map((button) => button.getAttribute("aria-label"));

    expect(hideNames).toHaveLength(truncatedRecognitionRecords.length);
    expect(new Set(hideNames).size).toBe(truncatedRecognitionRecords.length);

    const [first, second] = truncatedRecognitionRecords;
    expect(first).toBeDefined();
    expect(second).toBeDefined();
    if (!first || !second) return;

    const firstCard = recognitionCard(gallery, first.id);
    const firstHideButton = within(firstCard).getByRole("button", {
      name: `Hide Full Recognition for ${first.title} (${first.id})`,
    });
    await user.click(firstHideButton);

    expect(firstHideButton).toHaveAccessibleName(
      `Read Full Recognition for ${first.title} (${first.id})`,
    );
    expect(firstHideButton).toHaveAttribute("aria-expanded", "false");
    expect(firstCard.querySelector("[data-recognition-preview]")).toBeVisible();
    expect(
      document.getElementById(`${first.id}-recognition-details`),
    ).not.toBeVisible();
    expect(
      within(recognitionCard(gallery, second.id)).getByRole("button", {
        name: `Hide Full Recognition for ${second.title} (${second.id})`,
      }),
    ).toHaveAttribute("aria-expanded", "true");
  });

  it("renders every complete preview once without disclosure controls or duplicate details", async () => {
    const { gallery, user } = renderGallery();

    await user.click(
      within(gallery).getByRole("button", {
        name: "All (25)",
      }),
    );

    expect(truncatedRecognitionRecords.length).toBeGreaterThan(0);
    expect(completeRecognitionRecords.length).toBeGreaterThan(0);
    expect(
      truncatedRecognitionRecords.length + completeRecognitionRecords.length,
    ).toBe(recognitionRecords.length);

    for (const recognition of completeRecognitionRecords) {
      const card = recognitionCard(gallery, recognition.id);
      const descriptionCopies = Array.from(card.querySelectorAll("p")).filter(
        (paragraph) => paragraph.textContent === recognition.description,
      );

      expect(descriptionCopies).toHaveLength(1);
      expect(descriptionCopies[0]).toBeVisible();
      expect(descriptionCopies[0]).toHaveAttribute(
        "data-recognition-preview",
      );
      expect(
        within(card).queryByRole("button", { name: /Full Recognition/ }),
      ).not.toBeInTheDocument();
      expect(
        document.getElementById(`${recognition.id}-recognition-details`),
      ).toBeNull();
    }
  });

  it("moves focus to the selected view before replacing focused carousel or grid content", async () => {
    const { gallery, user } = renderGallery();
    const innovationView = within(gallery).getByRole("button", {
      name: "Innovation (14)",
    });
    const autoplayControl = within(gallery).getByRole("button", {
      name: "Pause recognition highlights autoplay",
    });

    autoplayControl.focus();
    expect(autoplayControl).toHaveFocus();
    fireEvent.click(innovationView);

    expect(innovationView).toHaveFocus();
    expect(
      within(gallery).queryByRole("region", {
        name: "Recognition highlights carousel",
      }),
    ).not.toBeInTheDocument();
    expect(recognitionIds(gallery)).toEqual(chronologicalCategoryIds.Innovation);

    const nonHighlightTruncated = truncatedRecognitionRecords.find(
      (recognition) =>
        recognition.category === "Innovation" &&
        !highlightIds.includes(
          recognition.id as (typeof highlightIds)[number],
        ),
    );
    expect(nonHighlightTruncated).toBeDefined();
    if (!nonHighlightTruncated) return;

    const hiddenCardButton = within(
      recognitionCard(gallery, nonHighlightTruncated.id),
    ).getByRole("button", { name: /Read Full Recognition/ });
    hiddenCardButton.focus();

    const highlightsView = within(gallery).getByRole("button", {
      name: "Highlights (6)",
    });
    fireEvent.click(highlightsView);

    expect(highlightsView).toHaveFocus();
    expect(recognitionIds(gallery)).toEqual(highlightIds);
    expect(
      within(gallery).getByRole("region", {
        name: "Recognition highlights carousel",
      }),
    ).toBeInTheDocument();

    await user.click(
      within(gallery).getByRole("button", { name: "All (25)" }),
    );
    expect(recognitionIds(gallery)).toEqual(chronologicalIds);
  });

  it("moves focus to a new category before it removes the focused card", async () => {
    const { gallery, user } = renderGallery();

    await user.click(
      within(gallery).getByRole("button", {
        name: "All (25)",
      }),
    );

    const mentorshipCardButton = within(
      recognitionCard(gallery, "priyanka-181224"),
    ).getByRole("button", { name: /Read Full Recognition/ });
    mentorshipCardButton.focus();
    expect(mentorshipCardButton).toHaveFocus();

    const innovationFilter = within(gallery).getByRole("button", {
      name: "Innovation (14)",
    });
    fireEvent.click(innovationFilter);

    expect(innovationFilter).toHaveFocus();
    expect(recognitionCard(gallery, "pal-050723")).toBeInTheDocument();
    expect(
      gallery.querySelector('[data-recognition-id="priyanka-181224"]'),
    ).toBeNull();
  });

  it("runs autoplay only while the highlights carousel intersects the viewport", () => {
    vi.useFakeTimers();
    const { unmount } = render(<RecognitionGallery />);
    const observer = intersectionObservers.at(-1);

    expect(observer).toBeDefined();
    expect(observer?.observe).toHaveBeenCalledWith(
      screen.getByRole("region", {
        name: "Recognition highlights carousel",
      }),
    );
    expect(vi.getTimerCount()).toBe(0);

    setLatestCarouselIntersection(true);
    expect(vi.getTimerCount()).toBe(1);

    setLatestCarouselIntersection(false);
    expect(vi.getTimerCount()).toBe(0);

    setLatestCarouselIntersection(true);
    expect(vi.getTimerCount()).toBe(1);

    unmount();
    expect(observer?.disconnect).toHaveBeenCalledOnce();
    expect(vi.getTimerCount()).toBe(0);
  });

  it("autoplays within the finite track, wraps at the end, and uses no interval", () => {
    vi.useFakeTimers();
    const intervalSpy = vi.spyOn(globalThis, "setInterval");
    const { gallery } = renderGallery();
    const carousel = within(gallery).getByRole("region", {
      name: "Recognition highlights carousel",
    });
    const track = recognitionHighlightTrack(gallery);
    const { scrollBy, setScrollLeft } = configureHorizontalScroll(track, {
      clientWidth: 320,
      scrollWidth: 960,
    });

    setScrollLeft(0);

    expect(recognitionIds(gallery)).toHaveLength(6);
    expect(
      within(carousel).getByRole("button", {
        name: "Pause recognition highlights autoplay",
      }),
    ).toBeVisible();
    expect(vi.getTimerCount()).toBe(0);
    setLatestCarouselIntersection(true);
    expect(vi.getTimerCount()).toBeGreaterThan(0);

    act(() => vi.advanceTimersByTime(autoplayDelayMilliseconds));
    expect(scrollBy).toHaveBeenLastCalledWith({
      behavior: "smooth",
      left: 320,
    });

    act(() => vi.advanceTimersByTime(autoplayDelayMilliseconds));
    expect(scrollBy).toHaveBeenLastCalledWith({
      behavior: "smooth",
      left: 320,
    });
    expect(track.scrollLeft).toBe(640);

    act(() => vi.advanceTimersByTime(autoplayDelayMilliseconds));
    expect(scrollBy).toHaveBeenLastCalledWith({
      behavior: "smooth",
      left: -640,
    });
    expect(track.scrollLeft).toBe(0);

    expect(intervalSpy).not.toHaveBeenCalled();
    expect(within(gallery).queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("defaults to paused for reduced motion and permits an explicit play choice", () => {
    setReducedMotion(true);
    vi.useFakeTimers();
    const { gallery } = renderGallery();
    const track = recognitionHighlightTrack(gallery);
    const { scrollBy } = configureHorizontalScroll(track, {
      clientWidth: 320,
      scrollWidth: 960,
    });
    const play = within(gallery).getByRole("button", {
      name: "Play recognition highlights autoplay",
    });

    setLatestCarouselIntersection(true);
    expect(play).toHaveTextContent("Play autoplay");
    expect(vi.getTimerCount()).toBe(0);
    act(() => vi.advanceTimersByTime(autoplayDelayMilliseconds));
    expect(scrollBy).not.toHaveBeenCalled();

    fireEvent.click(play);
    expect(
      within(gallery).getByRole("button", {
        name: "Pause recognition highlights autoplay",
      }),
    ).toBeVisible();
    expect(vi.getTimerCount()).toBe(1);

    act(() => vi.advanceTimersByTime(autoplayDelayMilliseconds));
    expect(scrollBy).toHaveBeenLastCalledWith({
      behavior: "auto",
      left: 320,
    });
  });

  it("pauses for pointer hover and focus, then resumes unless explicitly paused", () => {
    vi.useFakeTimers();
    const { gallery } = renderGallery();
    const carousel = within(gallery).getByRole("region", {
      name: "Recognition highlights carousel",
    });
    const track = recognitionHighlightTrack(gallery);
    const { scrollBy } = configureHorizontalScroll(track, {
      clientWidth: 320,
      scrollWidth: 960,
    });

    setLatestCarouselIntersection(true);
    expect(vi.getTimerCount()).toBe(1);
    fireEvent.pointerEnter(carousel);
    expect(vi.getTimerCount()).toBe(0);
    act(() => vi.advanceTimersByTime(autoplayDelayMilliseconds));
    expect(scrollBy).not.toHaveBeenCalled();

    fireEvent.pointerLeave(carousel);
    expect(vi.getTimerCount()).toBe(1);

    const next = within(carousel).getByRole("button", {
      name: "Next recognition highlight",
    });
    fireEvent.focus(next);
    expect(vi.getTimerCount()).toBe(0);

    const highlightsView = within(gallery).getByRole("button", {
      name: "Highlights (6)",
    });
    fireEvent.blur(next, { relatedTarget: highlightsView });
    highlightsView.focus();
    expect(vi.getTimerCount()).toBeGreaterThan(0);

    const pause = within(carousel).getByRole("button", {
      name: "Pause recognition highlights autoplay",
    });
    fireEvent.click(pause);
    fireEvent.pointerEnter(carousel);
    fireEvent.pointerLeave(carousel);
    act(() => vi.advanceTimersByTime(autoplayDelayMilliseconds * 2));
    expect(scrollBy).not.toHaveBeenCalled();
    expect(
      within(carousel).getByRole("button", {
        name: "Play recognition highlights autoplay",
      }),
    ).toBeVisible();
  });

  it("preserves the autoplay choice while switching immediate views", () => {
    vi.useFakeTimers();
    const { gallery } = renderGallery();
    const pause = within(gallery).getByRole("button", {
      name: "Pause recognition highlights autoplay",
    });

    fireEvent.click(pause);
    fireEvent.click(
      within(gallery).getByRole("button", { name: "Mentorship (5)" }),
    );
    expect(recognitionIds(gallery)).toEqual(chronologicalCategoryIds.Mentorship);
    expect(vi.getTimerCount()).toBe(0);

    fireEvent.click(
      within(gallery).getByRole("button", { name: "Highlights (6)" }),
    );
    setLatestCarouselIntersection(true);
    expect(
      within(gallery).getByRole("button", {
        name: "Play recognition highlights autoplay",
      }),
    ).toBeVisible();
    expect(vi.getTimerCount()).toBe(0);

    fireEvent.click(
      within(gallery).getByRole("button", {
        name: "Play recognition highlights autoplay",
      }),
    );
    expect(vi.getTimerCount()).toBe(1);

    fireEvent.click(
      within(gallery).getByRole("button", { name: "Leadership (6)" }),
    );
    expect(recognitionIds(gallery)).toEqual(chronologicalCategoryIds.Leadership);
    expect(vi.getTimerCount()).toBe(0);

    fireEvent.click(
      within(gallery).getByRole("button", { name: "Highlights (6)" }),
    );
    expect(vi.getTimerCount()).toBe(0);
    setLatestCarouselIntersection(true);
    expect(
      within(gallery).getByRole("button", {
        name: "Pause recognition highlights autoplay",
      }),
    ).toBeVisible();
    expect(vi.getTimerCount()).toBe(1);
  });

  it("suspends autoplay while the page is hidden and clears its timer on unmount", () => {
    vi.useFakeTimers();
    const originalVisibility = Object.getOwnPropertyDescriptor(
      document,
      "visibilityState",
    );
    Object.defineProperty(document, "visibilityState", {
      configurable: true,
      value: "visible",
    });

    const { unmount } = render(<RecognitionGallery />);
    setLatestCarouselIntersection(true);
    expect(vi.getTimerCount()).toBe(1);

    Object.defineProperty(document, "visibilityState", {
      configurable: true,
      value: "hidden",
    });
    fireEvent(document, new Event("visibilitychange"));
    expect(vi.getTimerCount()).toBe(0);

    Object.defineProperty(document, "visibilityState", {
      configurable: true,
      value: "visible",
    });
    fireEvent(document, new Event("visibilitychange"));
    expect(vi.getTimerCount()).toBe(1);

    unmount();
    expect(vi.getTimerCount()).toBe(0);

    if (originalVisibility) {
      Object.defineProperty(
        document,
        "visibilityState",
        originalVisibility,
      );
    } else {
      Reflect.deleteProperty(document, "visibilityState");
    }
  });
});
