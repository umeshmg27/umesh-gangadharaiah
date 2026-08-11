import { fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";

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
const highlightIds = recognitionRecords
  .filter((recognition) => recognition.highlightOrder !== undefined)
  .sort(
    (left, right) =>
      (left.highlightOrder ?? Number.POSITIVE_INFINITY) -
      (right.highlightOrder ?? Number.POSITIVE_INFINITY),
  )
  .map(({ id }) => id);
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
  it("leads with the six approved highlights in highlight order", () => {
    const { gallery } = renderGallery();

    expect(
      within(gallery).getByRole("heading", {
        level: 2,
        name: "Recognition",
      }),
    ).toBeInTheDocument();
    expect(highlightIds).toEqual([
      "pal-050723",
      "yogi-070422",
      "priyanka-181224",
      "pra-080323",
      "rohi-171024",
      "ara-290923",
    ]);
    expect(recognitionIds(gallery)).toEqual(highlightIds);
    expect(
      within(gallery).getByRole("button", {
        name: "View all 25 recognitions",
      }),
    ).toHaveAttribute("aria-expanded", "false");
    expect(
      within(gallery).queryByRole("group", {
        name: "Filter recognitions by category",
      }),
    ).not.toBeInTheDocument();
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

  it("reveals all twenty-five recognitions in source order with exact filter counts", async () => {
    const { gallery, user } = renderGallery();

    await user.click(
      within(gallery).getByRole("button", {
        name: "View all 25 recognitions",
      }),
    );

    expect(recognitionIds(gallery)).toEqual(
      recognitionRecords.map(({ id }) => id),
    );
    expect(
      within(gallery).getByRole("button", {
        name: "Show recognition highlights",
      }),
    ).toHaveAttribute("aria-expanded", "true");
    expectOrdinaryCount(gallery, "Showing all 25 recognitions.");

    const filterGroup = within(gallery).getByRole("group", {
      name: "Filter recognitions by category",
    });
    expect(
      within(filterGroup).getByRole("button", { name: "All (25)" }),
    ).toHaveAttribute("aria-pressed", "true");

    for (const category of categories) {
      expect(
        within(filterGroup).getByRole("button", {
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

  it("filters by category without changing source order and exposes pressed state", async () => {
    const { gallery, user } = renderGallery();

    await user.click(
      within(gallery).getByRole("button", {
        name: "View all 25 recognitions",
      }),
    );

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
        recognitionRecords
          .filter((recognition) => recognition.category === category)
          .map(({ id }) => id),
      );
      expectOrdinaryCount(
        gallery,
        `Showing ${categoryCounts[category]} ${category} recognitions.`,
      );
    }

    await user.click(
      within(gallery).getByRole("button", { name: "All (25)" }),
    );
    expect(recognitionIds(gallery)).toEqual(
      recognitionRecords.map(({ id }) => id),
    );
  });

  it("renders stable semantic cards without changing copy, categories, tags, or image metadata", async () => {
    const { gallery, user } = renderGallery();

    await user.click(
      within(gallery).getByRole("button", {
        name: "View all 25 recognitions",
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
        name: "View all 25 recognitions",
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
        name: "View all 25 recognitions",
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

  it("moves focus before archive collapse hides content and resets the archive filter", async () => {
    const { gallery, user } = renderGallery();

    await user.click(
      within(gallery).getByRole("button", {
        name: "View all 25 recognitions",
      }),
    );
    const archiveOnlyTruncated = truncatedRecognitionRecords.find(
      (recognition) => recognition.highlightOrder === undefined,
    );

    expect(archiveOnlyTruncated).toBeDefined();
    if (!archiveOnlyTruncated) return;

    await user.click(
      within(gallery).getByRole("button", {
        name: `${archiveOnlyTruncated.category} (${categoryCounts[archiveOnlyTruncated.category]})`,
      }),
    );

    const hiddenCardButton = within(
      recognitionCard(gallery, archiveOnlyTruncated.id),
    ).getByRole("button", {
      name: /Read Full Recognition/,
    });
    hiddenCardButton.focus();
    expect(hiddenCardButton).toHaveFocus();

    const collapseControl = within(gallery).getByRole("button", {
      name: "Show recognition highlights",
    });
    fireEvent.click(collapseControl);

    expect(collapseControl).toHaveFocus();
    expect(collapseControl).toHaveAccessibleName("View all 25 recognitions");
    expect(recognitionIds(gallery)).toEqual(highlightIds);
    expect(
      within(gallery).queryByRole("group", {
        name: "Filter recognitions by category",
      }),
    ).not.toBeInTheDocument();

    await user.click(collapseControl);

    expect(recognitionIds(gallery)).toEqual(
      recognitionRecords.map(({ id }) => id),
    );
    expect(
      within(gallery).getByRole("button", { name: "All (25)" }),
    ).toHaveAttribute("aria-pressed", "true");
  });

  it("moves focus to a new filter before it removes the focused card", async () => {
    const { gallery, user } = renderGallery();

    await user.click(
      within(gallery).getByRole("button", {
        name: "View all 25 recognitions",
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

  it("renders no timer-driven autoplay affordance or modal", () => {
    const intervalSpy = vi.spyOn(globalThis, "setInterval");
    const timeoutSpy = vi.spyOn(globalThis, "setTimeout");
    const { gallery } = renderGallery();

    expect(intervalSpy).not.toHaveBeenCalled();
    expect(timeoutSpy).not.toHaveBeenCalled();
    expect(within(gallery).queryByRole("dialog")).not.toBeInTheDocument();
    expect(
      within(gallery).getByRole("region", {
        name: "Recognition highlights carousel",
      }),
    ).toHaveAttribute("aria-roledescription", "carousel");
    expect(gallery.querySelector("[data-autoplay]")).toBeNull();
  });
});
