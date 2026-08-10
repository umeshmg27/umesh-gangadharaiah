import { act, render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, expect, test, vi } from "vitest";

import App from "./App";
import ResponsivePortfolioImage from "./components/ResponsivePortfolioImage";
import type { LocalImageAsset, RemoteImageAsset } from "./content/models";
import globalCss from "./styles/global.css?raw";

beforeEach(() => {
  window.localStorage.clear();
  document.documentElement.dataset.theme = "dark";
  document.documentElement.style.colorScheme = "dark";
  Object.defineProperty(window, "matchMedia", {
    configurable: true,
    value: vi.fn(() => ({ matches: false })),
  });
});

afterEach(() => {
  vi.restoreAllMocks();
});

async function renderPortfolio() {
  const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(
    new Response(JSON.stringify([]), {
      headers: { "Content-Type": "application/json" },
    }),
  );

  await act(async () => {
    render(<App />);
  });

  return fetchSpy;
}

test("renders the semantic shell without dropping the five legacy sections", async () => {
  const fetchSpy = await renderPortfolio();

  expect(screen.getByRole("banner")).toBeInTheDocument();
  expect(
    screen.getByRole("navigation", { name: "Primary navigation" }),
  ).toBeInTheDocument();
  const mainLandmark = screen.getByRole("main");
  expect(mainLandmark).toHaveAttribute("id", "main-content");
  expect(mainLandmark).toHaveAttribute("tabindex", "-1");
  mainLandmark.focus();
  expect(mainLandmark).toHaveFocus();
  expect(screen.getByRole("contentinfo")).toBeInTheDocument();
  expect(
    screen.getByRole("heading", {
      level: 1,
      name: "Umesh Gangadharaiah",
    }),
  ).toBeInTheDocument();

  for (const heading of [
    "Expertise",
    "Career",
    "Projects",
    "Recognition",
    "Contact Me",
  ]) {
    expect(screen.getByRole("heading", { name: heading })).toBeInTheDocument();
  }

  const main = screen.getByRole("main");
  expect(
    Array.from(
      main.querySelectorAll(
        "#expertise, #experience, #projects, #recognition, #contact",
      ),
      (section) => section.id,
    ),
  ).toEqual(["expertise", "experience", "projects", "recognition", "contact"]);
  expect(fetchSpy).toHaveBeenCalledTimes(1);
  expect(fetchSpy).toHaveBeenCalledWith(
    "/umesh-gangadharaiah/assets/json/mentorandteam.json",
  );
});

test("renders typed hero actions, safe named social links, and the fallback portrait", async () => {
  await renderPortfolio();
  const hero = screen.getByRole("region", { name: "Umesh Gangadharaiah" });

  expect(within(hero).getByText("Backend Engineer")).toBeInTheDocument();
  expect(
    within(hero).getByText("Distributed Systems & Infrastructure"),
  ).toBeInTheDocument();
  expect(within(hero).getByRole("link", { name: "View Work" })).toHaveAttribute(
    "href",
    "#projects",
  );
  expect(within(hero).getByRole("link", { name: "Contact" })).toHaveAttribute(
    "href",
    "#contact",
  );

  for (const name of ["GitHub", "LinkedIn"]) {
    const socialLink = within(hero).getByRole("link", { name });
    expect(socialLink).toHaveAttribute("target", "_blank");
    expect(socialLink).toHaveAttribute("rel", "noopener noreferrer");
  }

  const portrait = within(hero).getByRole("img", {
    name: "Umesh Gangadharaiah",
  });
  expect(portrait.closest("picture")).not.toBeNull();
  expect(portrait.closest("picture")?.querySelectorAll("source")).toHaveLength(0);
  expect(portrait).toHaveAttribute("width", "800");
  expect(portrait).toHaveAttribute("height", "800");
  expect(portrait).toHaveAttribute("loading", "eager");
  expect(portrait).toHaveAttribute("decoding", "async");
});

test("renders the four typed impact metrics in their source order", async () => {
  await renderPortfolio();
  const impact = screen.getByRole("region", { name: "Impact" });

  expect(within(impact).getAllByRole("listitem").map((item) => item.textContent)).toEqual(
    [
      "50,000+policy objects indexed",
      "Sub-secondpolicy retrieval",
      "300+ hoursmanual effort saved",
      "70%manual effort reduced",
    ],
  );
});

test("keeps all five navigation destinations as real anchors", async () => {
  await renderPortfolio();
  const navigation = screen.getByRole("navigation", {
    name: "Primary navigation",
  });

  expect(
    within(navigation)
      .getAllByRole("link")
      .map((link) => link.getAttribute("href")),
  ).toEqual([
    "#expertise",
    "#experience",
    "#projects",
    "#recognition",
    "#contact",
  ]);
});

test("renders remote image records as a plain intrinsic image", () => {
  const remoteImage = {
    kind: "remote",
    alt: "Remote project preview",
    src: "https://example.com/project.png",
    width: 1200,
    height: 675,
  } as const satisfies RemoteImageAsset;

  render(<ResponsivePortfolioImage image={remoteImage} loading="lazy" />);

  const image = screen.getByRole("img", { name: remoteImage.alt });
  expect(image.closest("picture")).toBeNull();
  expect(image).toHaveAttribute("src", remoteImage.src);
  expect(image).toHaveAttribute("width", "1200");
  expect(image).toHaveAttribute("height", "675");
  expect(image).toHaveAttribute("loading", "lazy");
  expect(image).toHaveAttribute("decoding", "async");
});

test("combines local WebP candidates into one responsive source", () => {
  const localImage = {
    kind: "local",
    alt: "Local project preview",
    fallbackSrc: "/project.png",
    sources: [
      { src: "/project-480.webp", width: 480, type: "image/webp" },
      { src: "/project-960.webp", width: 960, type: "image/webp" },
    ],
    width: 1200,
    height: 675,
  } as const satisfies LocalImageAsset;
  const { rerender } = render(
    <ResponsivePortfolioImage image={localImage} loading="lazy" />,
  );

  const image = screen.getByRole("img", { name: localImage.alt });
  const picture = image.closest("picture");
  expect(picture?.querySelectorAll("source")).toHaveLength(1);
  expect(picture?.querySelector("source")).toHaveAttribute(
    "srcset",
    "/project-480.webp 480w, /project-960.webp 960w",
  );
  expect(picture?.querySelector("source")).toHaveAttribute("sizes", "100vw");
  expect(image).toHaveAttribute("src", localImage.fallbackSrc);
  expect(image).toHaveAttribute("width", "1200");
  expect(image).toHaveAttribute("height", "675");
  expect(image).toHaveAttribute("loading", "lazy");

  rerender(
    <ResponsivePortfolioImage
      image={localImage}
      loading="eager"
      sizes="(max-width: 40rem) 90vw, 30rem"
    />,
  );

  expect(picture?.querySelector("source")).toHaveAttribute(
    "sizes",
    "(max-width: 40rem) 90vw, 30rem",
  );
  expect(image).toHaveAttribute("loading", "eager");
});

test("temporarily corrects only known light-theme legacy foregrounds", () => {
  expect(globalCss).toMatch(
    /html\[data-theme="light"\] \.skills-container svg,[\s\S]*html\[data-theme="light"\] \.flex-chips \.chip-title\s*\{[^}]*color:\s*var\(--color-text\);/,
  );
  expect(globalCss).toMatch(
    /html\[data-theme="light"\] \.vertical-timeline span,[\s\S]*html\[data-theme="light"\] \.vertical-timeline-element-date\s*\{[^}]*color:\s*var\(--color-text-muted\);/,
  );
  expect(globalCss).not.toMatch(
    /html\[data-theme="light"\]\s+\.vertical-timeline\s+\*/,
  );
  expect(globalCss).not.toMatch(
    /html\[data-theme="light"\] \.svg-inline--fa\s*\{/,
  );
  expect(globalCss).toMatch(
    /html\[data-theme="light"\] \.vertical-timeline-element-icon \.svg-inline--fa\s*\{[^}]*color:\s*var\(--color-accent-contrast\);/,
  );
});

test("footer reuses named social links and preserves the original statement as text", async () => {
  await renderPortfolio();
  const footer = screen.getByRole("contentinfo");

  expect(within(footer).getByRole("link", { name: "GitHub" })).toHaveAttribute(
    "rel",
    "noopener noreferrer",
  );
  expect(within(footer).getByRole("link", { name: "LinkedIn" })).toHaveAttribute(
    "rel",
    "noopener noreferrer",
  );
  expect(footer).toHaveTextContent(
    "A portfolio designed & built by Umesh Gangadharaiah with 💜",
  );
  expect(
    within(footer).queryByRole("link", { name: "Umesh Gangadharaiah" }),
  ).not.toBeInTheDocument();
});
