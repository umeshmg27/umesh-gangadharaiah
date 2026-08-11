/// <reference lib="dom" />

import { expect, test, type Page } from "@playwright/test";

const localOrigin = "http://127.0.0.1:4173";
const transparentPixel = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=",
  "base64",
);
const approvedViewportSizes: Readonly<
  Record<string, { readonly height: number; readonly width: number }>
> = {
  "phone-390x844": { height: 844, width: 390 },
  "tablet-768x1024": { height: 1024, width: 768 },
  "laptop-1440x900": { height: 900, width: 1440 },
  "wide-1920x1080": { height: 1080, width: 1920 },
};

function monitorBrowserProblems(page: Page): {
  assertNone: () => void;
} {
  const problems: string[] = [];

  page.on("console", (message) => {
    if (message.type() === "error" || message.type() === "warning") {
      problems.push(`console ${message.type()}: ${message.text()}`);
    }
  });
  page.on("pageerror", (error) => problems.push(`page error: ${error.message}`));

  return {
    assertNone: () => expect(problems).toEqual([]),
  };
}

async function makeRequestsDeterministic(page: Page): Promise<void> {
  await page.route(/^https?:\/\//u, async (route) => {
    const requestUrl = new URL(route.request().url());

    if (requestUrl.origin === localOrigin) {
      await route.fallback();
      return;
    }

    if (route.request().resourceType() === "image") {
      await route.fulfill({
        body: transparentPixel,
        contentType: "image/png",
        status: 200,
      });
      return;
    }

    await route.abort();
  });
}

async function openPortfolio(page: Page): Promise<void> {
  await makeRequestsDeterministic(page);
  await page.goto("./", { waitUntil: "networkidle" });
  await expect(page.locator("#root")).not.toBeEmpty();
}

async function gridColumnCount(page: Page, selector: string): Promise<number> {
  return page.locator(selector).evaluate((element) =>
    getComputedStyle(element)
      .gridTemplateColumns.split(/\s+/u)
      .filter(Boolean).length,
  );
}

async function expectNoHorizontalOverflow(page: Page): Promise<void> {
  const overflow = await page.evaluate(() => {
    const root = document.documentElement;
    const rootWidth = root.clientWidth;
    const offenders = [...document.body.querySelectorAll<HTMLElement>("*")]
      .filter((element) => {
        const style = getComputedStyle(element);
        const bounds = element.getBoundingClientRect();
        const horizontalScrollContainer = element.closest<HTMLElement>(
          "[data-contained-horizontal-scroll]",
        );
        const isContainedHorizontalSlide =
          horizontalScrollContainer !== null &&
          horizontalScrollContainer !== element &&
          ["auto", "scroll"].includes(
            getComputedStyle(horizontalScrollContainer).overflowX,
          );

        return (
          !isContainedHorizontalSlide &&
          style.display !== "none" &&
          style.visibility !== "hidden" &&
          style.position !== "fixed" &&
          bounds.width > 0 &&
          (bounds.left < -1 || bounds.right > rootWidth + 1)
        );
      })
      .slice(0, 10)
      .map((element) => ({
        name: element.tagName.toLowerCase(),
        testId:
          element.dataset.projectId ??
          element.dataset.recognitionId ??
          element.id ??
          element.textContent?.trim().slice(0, 40) ??
          "",
      }));

    return {
      clientWidth: rootWidth,
      offenders,
      rootOverflow: getComputedStyle(root).overflowX,
      bodyOverflow: getComputedStyle(document.body).overflowX,
      mainOverflow: getComputedStyle(document.querySelector("main")!).overflowX,
      scrollWidth: root.scrollWidth,
    };
  });

  expect(overflow.scrollWidth).toBeLessThanOrEqual(overflow.clientWidth + 1);
  expect(overflow.offenders).toEqual([]);
  expect([overflow.rootOverflow, overflow.bodyOverflow, overflow.mainOverflow]).not.toContain(
    "hidden",
  );
  expect([overflow.rootOverflow, overflow.bodyOverflow, overflow.mainOverflow]).not.toContain(
    "clip",
  );
}

test("uses the approved global design tokens", async ({ page }) => {
  const browser = monitorBrowserProblems(page);
  await openPortfolio(page);

  const tokens = await page.evaluate(() => {
    const style = getComputedStyle(document.documentElement);
    return {
      contentMax: style.getPropertyValue("--content-max").trim(),
      layoutMax: style.getPropertyValue("--layout-max").trim(),
      focusRing: style.getPropertyValue("--focus-ring").trim(),
      headerHeight: style.getPropertyValue("--header-height").trim(),
      pageGutter: style.getPropertyValue("--page-gutter").trim(),
      sectionSpace: style.getPropertyValue("--section-space").trim(),
    };
  });

  expect(tokens).toMatchObject({
    contentMax: "72rem",
    layoutMax: "90rem",
    headerHeight: "4rem",
    pageGutter: "clamp(1rem, 4vw, 3rem)",
    sectionSpace: "clamp(3rem, 6vw, 6rem)",
  });
  expect(tokens.focusRing).toMatch(/(?:^|\s)0?\.1875rem(?:\s|$)/u);
  browser.assertNone();
});

test("uses the approved aspect ratios and viewport layouts", async ({ page }) => {
  const browser = monitorBrowserProblems(page);
  await openPortfolio(page);

  const viewportWidth = page.viewportSize()?.width ?? 0;
  const expectedProjectColumns = viewportWidth >= 768 ? 2 : 1;
  const expectedContactColumns = viewportWidth >= 768 ? 2 : 1;
  const expectedExpertiseColumns = viewportWidth >= 768 ? 2 : 1;
  const expectedHeroColumns = viewportWidth >= 1024 ? 2 : 1;
  const expectedImpactColumns = viewportWidth >= 768 ? 3 : 1;
  const expectedRecognitionColumns = viewportWidth >= 1024 ? 3 : 1;
  const expectedTimelineColumns = viewportWidth >= 768 ? 3 : 2;

  expect(await gridColumnCount(page, "#project-results > div")).toBe(
    expectedProjectColumns,
  );
  expect(
    await gridColumnCount(page, 'section[aria-labelledby="hero-heading"]'),
  ).toBe(expectedHeroColumns);
  expect(await gridColumnCount(page, "#contact")).toBe(expectedContactColumns);
  expect(await gridColumnCount(page, "#expertise > div")).toBe(
    expectedExpertiseColumns,
  );
  expect(
    await gridColumnCount(
      page,
      'section[aria-labelledby="impact-heading"] > ul',
    ),
  ).toBe(expectedImpactColumns);
  expect(
    await gridColumnCount(
      page,
      '[aria-label="Career timeline, newest to oldest"] > li:first-child',
    ),
  ).toBe(expectedTimelineColumns);
  const timelineGeometry = await page
    .locator('[aria-label="Career timeline, newest to oldest"] > li')
    .first()
    .evaluate((entry) => {
      const marker = entry.querySelector<HTMLElement>("[data-timeline-marker]");
      const period = entry.querySelector<HTMLElement>(":scope > p");
      const card = entry.querySelector<HTMLElement>("article");

      if (!marker || !period || !card) {
        throw new Error("Missing timeline geometry element");
      }

      return {
        card: card.getBoundingClientRect().toJSON(),
        marker: marker.getBoundingClientRect().toJSON(),
        period: period.getBoundingClientRect().toJSON(),
      };
    });
  expect(timelineGeometry.marker.right).toBeLessThanOrEqual(
    timelineGeometry.card.left,
  );

  if (viewportWidth >= 768) {
    expect(timelineGeometry.period.right).toBeLessThanOrEqual(
      timelineGeometry.marker.left,
    );
  } else {
    expect(timelineGeometry.marker.right).toBeLessThanOrEqual(
      timelineGeometry.period.left,
    );
    expect(timelineGeometry.period.bottom).toBeLessThanOrEqual(
      timelineGeometry.card.top,
    );
  }

  const carousel = page.getByRole("region", {
    name: "Recognition highlights carousel",
  });
  const carouselTrack = carousel.getByLabel("Scrollable recognition highlights");
  const carouselGeometry = await carouselTrack.evaluate((track) => ({
    clientWidth: track.clientWidth,
    scrollSnapType: getComputedStyle(track).scrollSnapType,
    scrollWidth: track.scrollWidth,
  }));
  expect(carouselGeometry.scrollWidth).toBeGreaterThan(
    carouselGeometry.clientWidth,
  );
  expect(carouselGeometry.scrollSnapType).toContain("x mandatory");
  await expect(
    carousel.getByRole("button", { name: "Previous recognition highlight" }),
  ).toBeVisible();
  const nextHighlight = carousel.getByRole("button", {
    name: "Next recognition highlight",
  });
  await expect(nextHighlight).toBeVisible();
  await nextHighlight.focus();
  await carouselTrack.evaluate((track) => {
    track.scrollLeft = track.scrollWidth - track.clientWidth;
    track.dispatchEvent(new Event("scroll"));
  });
  await expect(nextHighlight).toHaveAttribute("aria-disabled", "true");
  await page.keyboard.press("Enter");
  await expect(nextHighlight).toBeFocused();

  if (viewportWidth >= 1440) {
    const wideSectionWidth = await page
      .locator('section[aria-labelledby="impact-heading"]')
      .evaluate((section) => section.getBoundingClientRect().width);
    expect(wideSectionWidth).toBeGreaterThan(1152);
  }

  await page.getByRole("button", { name: "All (25)" }).click();
  expect(await gridColumnCount(page, "#recognition-results > div")).toBe(
    expectedRecognitionColumns,
  );

  const projectRatio = await page
    .locator("[data-project-id] > div:first-child")
    .first()
    .evaluate((element) => {
      const bounds = element.getBoundingClientRect();
      return bounds.width / bounds.height;
    });
  const recognitionRatio = await page
    .locator("[data-recognition-id] > div:first-child")
    .first()
    .evaluate((element) => {
      const bounds = element.getBoundingClientRect();
      return bounds.width / bounds.height;
    });

  expect(projectRatio).toBeCloseTo(16 / 10, 1);
  expect(recognitionRatio).toBeCloseTo(4 / 3, 1);

  const surnameLineFragments = await page.locator("#hero-heading").evaluate((heading) => {
    const textNode = heading.firstChild;
    const surname = "Gangadharaiah";
    const start = textNode?.textContent?.indexOf(surname) ?? -1;

    if (!(textNode instanceof Text) || start < 0) {
      return 0;
    }

    const range = document.createRange();
    range.setStart(textNode, start);
    range.setEnd(textNode, start + surname.length);
    return [...range.getClientRects()].filter((rectangle) => rectangle.width > 0)
      .length;
  });
  expect(surnameLineFragments).toBe(1);
  await expectNoHorizontalOverflow(page);
  browser.assertNone();
});

test("autoplays recognition highlights without taking control from the visitor", async ({
  page,
}) => {
  const browser = monitorBrowserProblems(page);
  await page.clock.install();
  await openPortfolio(page);

  const carousel = page.getByRole("region", {
    name: "Recognition highlights carousel",
  });
  const track = carousel.getByLabel("Scrollable recognition highlights");
  const pause = carousel.getByRole("button", {
    name: "Pause recognition highlights autoplay",
  });

  await track.evaluate((element) => {
    const trackElement = element as HTMLElement;

    Object.defineProperty(trackElement, "scrollBy", {
      configurable: true,
      value: ({ left = 0 }: ScrollToOptions) => {
        const maximumScrollLeft = Math.max(
          0,
          trackElement.scrollWidth - trackElement.clientWidth,
        );
        trackElement.scrollLeft = Math.max(
          0,
          Math.min(maximumScrollLeft, trackElement.scrollLeft + left),
        );
        trackElement.dispatchEvent(new Event("scroll"));
      },
    });
  });

  await expect(pause).toBeVisible();
  expect(await track.evaluate((element) => element.scrollLeft)).toBe(0);

  await page.clock.runFor(12_000);
  expect(await track.evaluate((element) => element.scrollLeft)).toBe(0);

  await carousel.scrollIntoViewIfNeeded();
  await page.waitForTimeout(100);

  await page.clock.runFor(7_000);
  const automaticallyAdvanced = await track.evaluate(
    (element) => element.scrollLeft,
  );
  expect(automaticallyAdvanced).toBeGreaterThan(0);

  await page.locator("#hero-heading").scrollIntoViewIfNeeded();
  await expect(carousel).not.toBeInViewport();
  await page.evaluate(() => {
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
  });
  await page.clock.runFor(12_000);
  expect(await track.evaluate((element) => element.scrollLeft)).toBeCloseTo(
    automaticallyAdvanced,
    0,
  );

  await carousel.scrollIntoViewIfNeeded();
  await expect(carousel).toBeInViewport();
  await page.waitForTimeout(100);

  await carousel.hover();
  await page.clock.runFor(12_000);
  expect(await track.evaluate((element) => element.scrollLeft)).toBeCloseTo(
    automaticallyAdvanced,
    0,
  );

  await page.locator("#recognition-heading").hover();
  const next = carousel.getByRole("button", {
    name: "Next recognition highlight",
  });
  await next.focus();
  await page.clock.runFor(12_000);
  expect(await track.evaluate((element) => element.scrollLeft)).toBeCloseTo(
    automaticallyAdvanced,
    0,
  );

  await pause.click();
  await expect(
    carousel.getByRole("button", {
      name: "Play recognition highlights autoplay",
    }),
  ).toBeFocused();
  browser.assertNone();
});

test("reveals archived work from a contextual impact link", async ({ page }) => {
  const browser = monitorBrowserProblems(page);
  await openPortfolio(page);

  await page.getByRole("link", { name: "View Codeshift project" }).click();
  await expect(page).toHaveURL(/#project-codeshift-cicd-platform$/u);

  const codeshift = page.locator("#project-codeshift-cicd-platform");
  await expect(codeshift).toBeVisible();
  await expect(codeshift).toContainText("reducing manual deployment effort by 70%");
  await expect(
    page.getByRole("button", { name: "Show featured projects" }),
  ).toHaveAttribute("aria-expanded", "true");
  await expect(codeshift).toBeInViewport();

  const offset = await page.evaluate(() => ({
    cardTop: document
      .getElementById("project-codeshift-cicd-platform")!
      .getBoundingClientRect().top,
    headerBottom: document.querySelector("header")!.getBoundingClientRect()
      .bottom,
  }));
  expect(offset.cardTop).toBeGreaterThanOrEqual(offset.headerBottom - 1);
  browser.assertNone();
});

test("supports mobile and desktop navigation with predictable keyboard focus", async ({
  page,
}) => {
  const browser = monitorBrowserProblems(page);
  await openPortfolio(page);

  const menuButton = page.getByRole("button", { name: "Open navigation" });
  const expertiseLink = page.getByRole("link", { name: "Expertise", exact: true });
  const isCompactNavigation = (page.viewportSize()?.width ?? 0) < 1024;

  await page.keyboard.press("Tab");
  const skipLink = page.getByRole("link", { name: "Skip to main content" });
  await expect(skipLink).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.locator("#main-content")).toBeFocused();

  if (isCompactNavigation) {
    await expect(menuButton).toBeVisible();
    await expect(expertiseLink).toBeHidden();
    await menuButton.focus();
    await page.keyboard.press("Enter");
    await expect(expertiseLink).toBeVisible();
    await expect(expertiseLink).toBeFocused();
    await page.keyboard.press("Escape");
    await expect(menuButton).toBeFocused();
    await expect(expertiseLink).toBeHidden();
  } else {
    await expect(menuButton).toBeHidden();
    await expect(expertiseLink).toBeVisible();
  }
  browser.assertNone();
});

test("keeps project archives and immediate recognition views usable", async ({
  page,
}) => {
  const browser = monitorBrowserProblems(page);
  await openPortfolio(page);

  const pageHeadings = page.getByRole("heading", { level: 1 });
  await expect(pageHeadings).toHaveCount(1);
  await expect(pageHeadings).toHaveAccessibleName("Umesh Gangadharaiah");
  const primaryLinks = page.locator(
    'nav[aria-label="Primary navigation"] a[href^="#"]',
  );
  await expect(primaryLinks).toHaveCount(5);
  expect(
    await primaryLinks.evaluateAll((links) =>
      links.map((link) => link.getAttribute("href")),
    ),
  ).toEqual([
    "#expertise",
    "#experience",
    "#projects",
    "#recognition",
    "#contact",
  ]);
  await expect(page.getByText("50,000+", { exact: true })).toBeVisible();
  await expect(
    page.getByRole("heading", {
      name: "Backend Engineer - Distributed Systems & Infrastructure",
    }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Senior Software Engineer" }),
  ).toBeVisible();
  const currentCareer = page.locator(
    '[data-career-id="cisco-senior-software-engineer"]',
  );
  await expect(currentCareer).toContainText("Oct 2025 – Present");
  await expect(currentCareer).toContainText("Model Context Protocol (MCP)");
  await expect(currentCareer).toContainText("up to 5–6× per engineer");

  await expect(page.locator("[data-project-id]")).toHaveCount(4);
  await page.getByRole("button", { name: "View all 12 projects" }).click();
  await expect(page.locator("[data-project-id]")).toHaveCount(12);
  const archivedProject = page.locator(
    '[data-project-id="telegram-data-storage"]',
  );
  await expect(
    archivedProject.getByRole("heading", { name: "Telegram as Data Storage" }),
  ).toBeVisible();
  await expect(archivedProject).toContainText(
    "Personal project that uses Telegram chats as an ad-hoc storage service. Designed as a lightweight backup system for data dump using Telegram APIs and automation.",
  );
  await page.getByRole("searchbox", { name: "Search projects" }).fill("Telegram");
  await expect(page.locator("[data-project-id]")).toHaveCount(1);
  await expect(page.getByText("Showing 1 project.")).toBeVisible();

  const projectCard = page.locator("[data-project-id]").first();
  const projectDetails = projectCard.getByRole("button", {
    name: /Read Project Details/u,
  });
  await projectDetails.click();
  await expect(
    projectCard.getByRole("button", { name: /Hide Project Details/u }),
  ).toHaveAttribute("aria-expanded", "true");
  await expect(projectCard.locator('p[id$="-details"]')).toBeVisible();

  await expect(page.locator("[data-recognition-id]")).toHaveCount(6);
  expect(
    await page
      .locator("[data-recognition-id]")
      .evaluateAll((cards) => cards.map((card) => card.getAttribute("data-recognition-id"))),
  ).toEqual([
    "damo-211224",
    "priyanka-181224",
    "alfan-141124",
    "srid-181024",
    "rohi-171024",
    "atul-180724",
  ]);
  await expect(
    page.locator('[data-recognition-id="damo-211224"] time'),
  ).toHaveAttribute("datetime", "2024-12-21");

  await page.getByRole("button", { name: "Leadership (6)" }).click();
  await expect(page.locator("[data-recognition-id]")).toHaveCount(6);
  expect(
    await page
      .locator("[data-recognition-id]")
      .evaluateAll((cards) => cards.map((card) => card.getAttribute("data-recognition-id"))),
  ).toEqual([
    "damo-211224",
    "rohi-171024",
    "rohi-110624",
    "srid-010424",
    "rohi-100324",
    "ara-290923",
  ]);

  await page.getByRole("button", { name: "All (25)" }).click();
  await expect(page.locator("[data-recognition-id]")).toHaveCount(25);
  const archivedRecognition = page.locator(
    '[data-recognition-id="damo-211224"]',
  );
  await expect(archivedRecognition).toContainText(
    "Ownership towards NDO ESG triages",
  );
  await expect(archivedRecognition).toContainText(
    "You have been demonstrating ownership and responsibility triaging NDO ESG issues that saves QA cycle time. Keep up the good work.",
  );
  await page.getByRole("button", { name: /^Mentorship \(\d+\)$/u }).click();
  const mentorshipCards = page.locator('[data-recognition-category="Mentorship"]');
  await expect(mentorshipCards).not.toHaveCount(0);
  await expect(page.locator('[data-recognition-category]:not([data-recognition-category="Mentorship"])')).toHaveCount(
    0,
  );

  const recognitionCard = page.locator('[data-recognition-id="priyanka-181224"]');
  const recognitionDetails = recognitionCard.getByRole("button", {
    name: /Read Full Recognition for Cisco KT Sessions/u,
  });
  await recognitionDetails.click();
  await expect(
    recognitionCard.getByRole("button", {
      name: /Hide Full Recognition for Cisco KT Sessions/u,
    }),
  ).toHaveAttribute("aria-expanded", "true");
  await expect(page.locator("#priyanka-181224-recognition-details")).toBeVisible();
  await expectNoHorizontalOverflow(page);
  browser.assertNone();
});

test("switches and persists both approved themes", async ({ page }) => {
  const browser = monitorBrowserProblems(page);
  await page.emulateMedia({ colorScheme: "dark" });
  await openPortfolio(page);
  await page.evaluate(() => window.localStorage.removeItem("portfolio-theme"));
  await page.reload({ waitUntil: "networkidle" });

  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  const darkCanvas = await page.locator("body").evaluate(
    (element) => getComputedStyle(element).backgroundColor,
  );

  await page.getByRole("button", { name: "Switch to light theme" }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  const lightCanvas = await page.locator("body").evaluate(
    (element) => getComputedStyle(element).backgroundColor,
  );

  expect(lightCanvas).not.toBe(darkCanvas);
  expect(
    await page.evaluate(() => window.localStorage.getItem("portfolio-theme")),
  ).toBe("light");
  await page.reload({ waitUntil: "networkidle" });
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  browser.assertNone();
});

test("honors reduced motion and stable anchor offsets", async ({ page }) => {
  const browser = monitorBrowserProblems(page);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await openPortfolio(page);

  const motion = await page.evaluate(() => {
    const themeButton = document.querySelector<HTMLButtonElement>(
      'button[aria-label^="Switch to"]',
    )!;
    const buttonStyle = getComputedStyle(themeButton);

    return {
      animationDuration: buttonStyle.animationDuration,
      scrollBehavior: getComputedStyle(document.documentElement).scrollBehavior,
      transitionDuration: buttonStyle.transitionDuration,
    };
  });

  expect(motion.scrollBehavior).toBe("auto");
  expect(Number.parseFloat(motion.animationDuration)).toBeLessThanOrEqual(0.00001);
  expect(Number.parseFloat(motion.transitionDuration)).toBeLessThanOrEqual(0.00001);
  await expect(
    page.getByRole("button", {
      name: "Play recognition highlights autoplay",
    }),
  ).toBeVisible();

  for (const id of ["expertise", "experience", "projects", "recognition", "contact"]) {
    const scrollMargin = await page.locator(`#${id}`).evaluate((element) =>
      Number.parseFloat(getComputedStyle(element).scrollMarginTop),
    );
    expect(scrollMargin).toBeGreaterThanOrEqual(80);
  }
  browser.assertNone();
});

test("shows a stable visible alt-text fallback when an active image fails", async ({
  page,
}) => {
  const browser = monitorBrowserProblems(page);
  await page.route(/\/assets\/umesh-gangadharaiah-[^/]+\.(?:jpg|webp)$/u, async (route) => {
    await route.fulfill({
      body: "not an image",
      contentType: "image/jpeg",
      status: 200,
    });
  });
  await openPortfolio(page);

  const fallback = page.locator('[data-image-fallback][aria-label="Umesh Gangadharaiah"]');
  await expect(fallback).toBeVisible();
  await expect(fallback).toContainText("Image unavailable");
  await expect(fallback).toContainText("Umesh Gangadharaiah");
  const bounds = await fallback.boundingBox();
  expect(bounds?.width).toBeGreaterThan(0);
  expect(bounds?.height).toBeGreaterThan(0);
  browser.assertNone();
});

test("reflows after 200 percent text resizing without horizontal scrolling", async ({
  page,
}) => {
  const browser = monitorBrowserProblems(page);
  await openPortfolio(page);
  await page.evaluate(() => {
    document.documentElement.style.fontSize = "200%";
  });

  await expectNoHorizontalOverflow(page);
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  if ((page.viewportSize()?.width ?? 0) < 1024) {
    await expect(page.getByRole("button", { name: /navigation/u })).toBeVisible();
  } else {
    await expect(page.getByRole("button", { name: /Switch to/u })).toBeVisible();
  }
  browser.assertNone();
});

test("reflows at a 200 percent browser zoom equivalent without horizontal scrolling", async ({
  page,
}, testInfo) => {
  const browser = monitorBrowserProblems(page);
  const approvedViewport = approvedViewportSizes[testInfo.project.name];

  expect(
    approvedViewport,
    `approved viewport for ${testInfo.project.name}`,
  ).toBeDefined();
  expect(page.viewportSize()).toEqual(approvedViewport);
  await openPortfolio(page);

  const zoomedViewport = {
    height: Math.floor(approvedViewport.height / 2),
    width: Math.floor(approvedViewport.width / 2),
  };
  await page.setViewportSize(zoomedViewport);
  await page.reload({ waitUntil: "networkidle" });

  expect(page.viewportSize()).toEqual(zoomedViewport);
  await expectNoHorizontalOverflow(page);
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(page.locator("#projects")).toBeVisible();
  await expect(page.locator("[data-project-id]")).toHaveCount(4);
  await expect(page.locator("#recognition")).toBeVisible();
  await expect(page.locator("[data-recognition-id]")).toHaveCount(6);
  await expect(page.getByRole("form", { name: "Contact Umesh" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Open navigation" })).toBeVisible();
  browser.assertNone();
});
