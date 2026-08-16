import { act, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, expect, test, vi } from "vitest";

import { THEME_STORAGE_KEY } from "../theme/theme";
import Header from "./Header";
import headerCss from "./Header.module.css?raw";

const navigationItems = [
  ["Expertise", "#expertise"],
  ["Career", "#experience"],
  ["Projects", "#projects"],
  ["Blog", "#blog"],
  ["Recognition", "#recognition"],
  ["Contact", "#contact"],
] as const;

function getMobileMenuButton(name: "Open navigation" | "Close navigation") {
  const button = screen.getByLabelText(name);
  expect(button.tagName).toBe("BUTTON");
  button.style.display = "inline-flex";
  return button;
}

beforeEach(() => {
  window.history.replaceState(null, "", "/");
  window.localStorage.clear();
  delete document.documentElement.dataset.theme;
  document.documentElement.style.colorScheme = "";
  Object.defineProperty(window, "matchMedia", {
    configurable: true,
    value: vi.fn(() => ({ matches: false })),
  });
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

test("provides one named primary navigation with the six stable destinations", () => {
  render(<Header />);

  expect(screen.getByRole("banner")).toBeInTheDocument();
  expect(
    screen.getByRole("link", { name: "Skip to main content" }),
  ).toHaveAttribute("href", "#main-content");
  expect(
    screen.getByRole("link", { name: "Umesh Gangadharaiah home" }),
  ).toHaveTextContent("Umesh Gangadharaiah");

  const navigation = screen.getByRole("navigation", { hidden: true });
  expect(navigation).toHaveAttribute("aria-label", "Primary navigation");
  const links = within(navigation).getAllByRole("link", { hidden: true });

  expect(links).toHaveLength(6);
  expect(
    links.map((link) => [link.textContent, link.getAttribute("href")]),
  ).toEqual(navigationItems);
});

test("exposes named menu and theme controls with 44px CSS targets", () => {
  render(<Header />);

  const navigation = screen.getByRole("navigation", { hidden: true });
  expect(navigation).toHaveAttribute("aria-label", "Primary navigation");
  expect(navigation).toHaveAttribute("data-open", "false");

  expect(getMobileMenuButton("Open navigation")).toHaveAttribute(
    "aria-expanded",
    "false",
  );
  expect(getMobileMenuButton("Open navigation")).toHaveAttribute(
    "aria-controls",
    "primary-navigation-links",
  );
  expect(
    screen.getByRole("button", { name: "Switch to light theme" }),
  ).toBeInTheDocument();
  expect(headerCss).toMatch(
    /\.menuButton\s*\{[^}]*min-width:\s*44px;[^}]*min-height:\s*44px;/s,
  );
  expect(headerCss).toMatch(
    /\.themeButton\s*\{[^}]*min-width:\s*44px;[^}]*min-height:\s*44px;/s,
  );
  expect(headerCss).toMatch(
    /\.brand\s*\{[^}]*grid-column:\s*1;[^}]*grid-row:\s*1;/s,
  );
  expect(headerCss).toMatch(
    /\.navigation\s*\{[^}]*grid-column:\s*1\s*\/\s*-1;[^}]*grid-row:\s*2;/s,
  );
  expect(headerCss).toMatch(
    /\.controls\s*\{[^}]*grid-column:\s*2;[^}]*grid-row:\s*1;/s,
  );
  expect(headerCss).toMatch(
    /@container header-shell \(min-width: 80em\)[\s\S]*\.navigation,\s*\.navigation\[data-open="false"\]\s*\{[^}]*grid-column:\s*2;[^}]*grid-row:\s*1;/,
  );
  expect(headerCss).toMatch(
    /@container header-shell \(min-width: 80em\)[\s\S]*\.controls\s*\{[^}]*grid-column:\s*3;/,
  );
  expect(headerCss).toMatch(
    /\.header\s*\{[^}]*container-name:\s*header-shell;[^}]*container-type:\s*inline-size;/s,
  );
  expect(headerCss).toMatch(
    /\.navigation\[data-open="false"\]\s*\{[^}]*display:\s*none;/s,
  );
});

test("open menu starts at Expertise, tabs to Career, and Escape restores its button", async () => {
  const user = userEvent.setup();
  render(<Header />);
  const menuButton = getMobileMenuButton("Open navigation");

  await user.click(menuButton);
  expect(getMobileMenuButton("Close navigation")).toHaveAttribute(
    "aria-expanded",
    "true",
  );
  expect(screen.getByRole("link", { name: "Expertise" })).toHaveFocus();

  await user.tab();
  expect(screen.getByRole("link", { name: "Career" })).toHaveFocus();

  await user.keyboard("{Escape}");

  expect(menuButton).toHaveAttribute("aria-expanded", "false");
  expect(menuButton).toHaveFocus();
});

test("selecting from an open menu closes it and focuses the destination heading", async () => {
  const user = userEvent.setup();
  const animationFrames: FrameRequestCallback[] = [];
  const cancelAnimationFrame = vi.fn();
  vi.stubGlobal(
    "requestAnimationFrame",
    vi.fn((callback: FrameRequestCallback) => {
      animationFrames.push(callback);
      return animationFrames.length;
    }),
  );
  vi.stubGlobal("cancelAnimationFrame", cancelAnimationFrame);
  render(
    <>
      <Header />
      <main>
        {navigationItems.map(([label, href]) => (
          <section id={href.slice(1)} key={href}>
            <h2>{label}</h2>
          </section>
        ))}
      </main>
    </>,
  );

  await user.click(getMobileMenuButton("Open navigation"));
  await user.click(screen.getByRole("link", { name: "Career" }));

  expect(getMobileMenuButton("Open navigation")).toHaveAttribute(
    "aria-expanded",
    "false",
  );
  const careerHeading = screen.getByRole("heading", { name: "Career" });
  expect(careerHeading).not.toHaveFocus();
  expect(window.location.hash).toBe("#experience");
  expect(animationFrames).toHaveLength(1);

  act(() => animationFrames[0](performance.now()));

  expect(careerHeading).toHaveAttribute("tabindex", "-1");
  expect(careerHeading).toHaveFocus();
  expect(cancelAnimationFrame).toHaveBeenCalledTimes(1);
});

test("toggles, applies, and safely stores a device-local theme preference", async () => {
  const user = userEvent.setup();
  const setItem = vi.spyOn(Storage.prototype, "setItem");
  document.documentElement.dataset.theme = "dark";
  document.documentElement.style.colorScheme = "dark";
  render(<Header />);

  await user.click(
    screen.getByRole("button", { name: "Switch to light theme" }),
  );

  expect(document.documentElement.dataset.theme).toBe("light");
  expect(document.documentElement.style.colorScheme).toBe("light");
  expect(setItem).toHaveBeenCalledWith(THEME_STORAGE_KEY, "light");
  expect(
    screen.getByRole("button", { name: "Switch to dark theme" }),
  ).toBeInTheDocument();
});

test("uses the valid pre-render theme even when storage reads fail", () => {
  vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
    throw new Error("storage unavailable");
  });
  document.documentElement.dataset.theme = "light";

  expect(() => render(<Header />)).not.toThrow();
  expect(
    screen.getByRole("button", { name: "Switch to dark theme" }),
  ).toBeInTheDocument();
});

test("applies theme changes even when storage writes fail", async () => {
  const user = userEvent.setup();
  vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
    throw new Error("storage unavailable");
  });
  document.documentElement.dataset.theme = "dark";
  render(<Header />);

  await expect(
    user.click(screen.getByRole("button", { name: "Switch to light theme" })),
  ).resolves.toBeUndefined();
  expect(document.documentElement.dataset.theme).toBe("light");
});
