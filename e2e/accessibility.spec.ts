/// <reference lib="dom" />

import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

const localOrigin = "http://127.0.0.1:4173";
const transparentPixel = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=",
  "base64",
);

async function openDeterministicPortfolio(page: Page): Promise<void> {
  await page.route(/^https?:\/\//u, async (route) => {
    const requestUrl = new URL(route.request().url());

    if (requestUrl.origin === localOrigin) {
      await route.fallback();
    } else if (route.request().resourceType() === "image") {
      await route.fulfill({
        body: transparentPixel,
        contentType: "image/png",
        status: 200,
      });
    } else {
      await route.abort();
    }
  });

  await page.goto("./", { waitUntil: "networkidle" });
  await expect(page.locator("#root")).not.toBeEmpty();
}

test("has no serious or critical Axe violations in dark and light themes", async ({
  page,
}, testInfo) => {
  await openDeterministicPortfolio(page);
  await page.getByRole("button", { name: "View all 12 projects" }).click();
  await page.getByRole("button", { name: "View all 25 recognitions" }).click();
  if ((page.viewportSize()?.width ?? 0) < 1024) {
    await page.getByRole("button", { name: "Open navigation" }).click();
  }

  for (const theme of ["dark", "light"] as const) {
    await page.evaluate((selectedTheme) => {
      document.documentElement.dataset.theme = selectedTheme;
      document.documentElement.style.colorScheme = selectedTheme;
    }, theme);

    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .analyze();
    const seriousOrCritical = results.violations.filter(
      (violation) =>
        violation.impact === "serious" || violation.impact === "critical",
    );

    await testInfo.attach(`axe-${theme}`, {
      body: JSON.stringify(
        {
          passes: results.passes.length,
          violations: seriousOrCritical,
        },
        null,
        2,
      ),
      contentType: "application/json",
    });
    expect(seriousOrCritical).toEqual([]);
  }
});

test("keeps every visible interactive target at least 44 pixels square", async ({
  page,
}) => {
  await openDeterministicPortfolio(page);
  await page.getByRole("button", { name: "View all 12 projects" }).click();
  await page.getByRole("button", { name: "View all 25 recognitions" }).click();
  if ((page.viewportSize()?.width ?? 0) < 1024) {
    await page.getByRole("button", { name: "Open navigation" }).click();
  }

  const undersizedTargets = await page
    .locator('a[href], button, input, textarea, select, summary, [tabindex]:not([tabindex="-1"])')
    .evaluateAll((elements) =>
      elements.flatMap((element) => {
        const target = element as HTMLElement;
        const style = getComputedStyle(target);
        const bounds = target.getBoundingClientRect();
        const isVisible =
          style.display !== "none" &&
          style.visibility !== "hidden" &&
          bounds.width > 0 &&
          bounds.height > 0;

        if (!isVisible || (bounds.width >= 44 && bounds.height >= 44)) {
          return [];
        }

        return [
          {
            height: bounds.height,
            label:
              target.getAttribute("aria-label") ??
              target.textContent?.trim().slice(0, 60) ??
              target.tagName.toLowerCase(),
            tag: target.tagName.toLowerCase(),
            width: bounds.width,
          },
        ];
      }),
    );

  expect(undersizedTargets).toEqual([]);
});

test("exposes a visible keyboard focus indicator", async ({ page }) => {
  await openDeterministicPortfolio(page);
  await page.evaluate(() => (document.activeElement as HTMLElement | null)?.blur());
  await page.keyboard.press("Tab");

  const skipLink = page.getByRole("link", { name: "Skip to main content" });
  await expect(skipLink).toBeFocused();
  const focusStyle = await skipLink.evaluate((element) => {
    const style = getComputedStyle(element);
    return {
      boxShadow: style.boxShadow,
      outlineStyle: style.outlineStyle,
      outlineWidth: style.outlineWidth,
    };
  });

  expect(
    focusStyle.boxShadow !== "none" ||
      (focusStyle.outlineStyle !== "none" &&
        Number.parseFloat(focusStyle.outlineWidth) >= 2),
  ).toBe(true);
});

test("keeps a distinct focus layer on the selected recognition filter in both themes", async ({
  page,
}) => {
  await openDeterministicPortfolio(page);
  await page.getByRole("button", { name: "View all 25 recognitions" }).click();

  const filter = page.getByRole("button", { name: /^Mentorship \(\d+\)$/u });
  await filter.focus();
  await page.keyboard.press("Enter");

  await expect(filter).toHaveAttribute("aria-pressed", "true");
  const readShadowState = () =>
    filter.evaluate((element) => {
      function splitTopLevelShadowLayers(value: string): string[] {
        const layers: string[] = [];
        let depth = 0;
        let layerStart = 0;

        for (let index = 0; index < value.length; index += 1) {
          const character = value[index];

          if (character === "(") depth += 1;
          else if (character === ")") depth = Math.max(0, depth - 1);
          else if (character === "," && depth === 0) {
            layers.push(value.slice(layerStart, index).trim());
            layerStart = index + 1;
          }
        }

        const finalLayer = value.slice(layerStart).trim();
        if (finalLayer && finalLayer !== "none") layers.push(finalLayer);
        return layers;
      }

      const boxShadow = getComputedStyle(element).boxShadow;
      return {
        boxShadow,
        focusVisible: element.matches(":focus-visible"),
        layers: splitTopLevelShadowLayers(boxShadow),
      };
    });

  for (const theme of ["dark", "light"] as const) {
    await page.evaluate((selectedTheme) => {
      document.documentElement.dataset.theme = selectedTheme;
      document.documentElement.style.colorScheme = selectedTheme;
    }, theme);

    await filter.evaluate((element) => element.blur());
    await expect(filter).not.toBeFocused();
    const blurredState = await readShadowState();

    expect(blurredState.focusVisible, `${theme} blurred filter state`).toBe(
      false,
    );
    expect(
      blurredState.layers.some((layer) => layer.includes("inset")),
      `${theme} blurred selection layer`,
    ).toBe(true);
    expect(
      blurredState.layers.filter((layer) => !layer.includes("inset")),
      `${theme} blurred outer focus layers`,
    ).toHaveLength(0);

    await page
      .getByRole("button", { name: /^Innovation \(\d+\)$/u })
      .focus();
    await page.keyboard.press("Tab");
    await expect(filter).toBeFocused();
    const focusedState = await readShadowState();

    expect(focusedState.focusVisible, `${theme} keyboard focus state`).toBe(
      true,
    );
    expect(
      focusedState.layers.length,
      `${theme} focused shadow layers`,
    ).toBeGreaterThanOrEqual(2);
    expect(
      focusedState.layers.some((layer) => layer.includes("inset")),
      `${theme} focused selection layer`,
    ).toBe(true);
    expect(
      focusedState.layers.some((layer) => !layer.includes("inset")),
      `${theme} focused outer layer`,
    ).toBe(true);
    expect(
      focusedState.boxShadow,
      `${theme} focused shadow differs from blurred selection`,
    ).not.toBe(blurredState.boxShadow);
  }
});

test("keeps contact form placeholders at AA contrast in both themes", async ({
  page,
}) => {
  await openDeterministicPortfolio(page);
  const nameInput = page.getByRole("textbox", { name: "Your Name" });

  for (const theme of ["dark", "light"] as const) {
    await page.evaluate((selectedTheme) => {
      document.documentElement.dataset.theme = selectedTheme;
      document.documentElement.style.colorScheme = selectedTheme;
    }, theme);

    const placeholderContrast = await nameInput.evaluate((element) => {
      function parseColor(value: string): [number, number, number, number] {
        const channels = value.match(/[\d.]+/gu)?.map(Number) ?? [];
        return [
          channels[0] ?? 0,
          channels[1] ?? 0,
          channels[2] ?? 0,
          channels[3] ?? 1,
        ];
      }

      function relativeLuminance([red, green, blue]: readonly number[]): number {
        const linearChannels = [red, green, blue].map((channel) => {
          const normalized = channel / 255;
          return normalized <= 0.04045
            ? normalized / 12.92
            : ((normalized + 0.055) / 1.055) ** 2.4;
        });
        return (
          0.2126 * linearChannels[0] +
          0.7152 * linearChannels[1] +
          0.0722 * linearChannels[2]
        );
      }

      const inputStyle = getComputedStyle(element);
      const placeholderStyle = getComputedStyle(element, "::placeholder");
      const background = parseColor(inputStyle.backgroundColor);
      const foreground = parseColor(placeholderStyle.color);
      const opacity =
        foreground[3] * Number.parseFloat(placeholderStyle.opacity || "1");
      const compositedForeground = foreground
        .slice(0, 3)
        .map(
          (channel, index) =>
            channel * opacity + background[index] * (1 - opacity),
        );
      const foregroundLuminance = relativeLuminance(compositedForeground);
      const backgroundLuminance = relativeLuminance(background);

      return (
        (Math.max(foregroundLuminance, backgroundLuminance) + 0.05) /
        (Math.min(foregroundLuminance, backgroundLuminance) + 0.05)
      );
    });

    expect(
      placeholderContrast,
      `${theme} placeholder contrast`,
    ).toBeGreaterThanOrEqual(4.5);
  }
});
