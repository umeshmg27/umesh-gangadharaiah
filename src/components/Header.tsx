import { useEffect, useRef, useState } from "react";

import { profile } from "../content/profile";
import {
  applyTheme,
  resolveInitialTheme,
  THEME_STORAGE_KEY,
  type Theme,
} from "../theme/theme";
import styles from "./Header.module.css";

const navigationItems = [
  { label: "Expertise", href: "#expertise" },
  { label: "Career", href: "#experience" },
  { label: "Projects", href: "#projects" },
  { label: "Recognition", href: "#recognition" },
  { label: "Contact", href: "#contact" },
] as const;

function isTheme(value: string | undefined): value is Theme {
  return value === "dark" || value === "light";
}

function readInitialTheme(): Theme {
  const renderedTheme = document.documentElement.dataset.theme;

  if (isTheme(renderedTheme)) {
    return renderedTheme;
  }

  let storedTheme: string | null = null;
  let prefersLight = false;

  try {
    storedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);
  } catch {
    storedTheme = null;
  }

  try {
    prefersLight =
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-color-scheme: light)").matches;
  } catch {
    prefersLight = false;
  }

  return resolveInitialTheme(storedTheme, prefersLight);
}

function focusDestination(href: string): void {
  const section = document.getElementById(href.slice(1));
  const heading = section?.querySelector<HTMLElement>("h1, h2, h3, h4, h5, h6");

  if (!heading) {
    return;
  }

  if (!heading.hasAttribute("tabindex")) {
    heading.tabIndex = -1;
  }

  heading.focus({ preventScroll: true });
}

export default function Header() {
  const [theme, setTheme] = useState<Theme>(readInitialTheme);
  const [menuOpen, setMenuOpen] = useState(false);
  const [pendingDestination, setPendingDestination] = useState<string | null>(
    null,
  );
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const firstNavigationLinkRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  useEffect(() => {
    if (!menuOpen) {
      return undefined;
    }

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key !== "Escape") {
        return;
      }

      setMenuOpen(false);
      menuButtonRef.current?.focus();
    };

    document.addEventListener("keydown", closeOnEscape);

    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [menuOpen]);

  useEffect(() => {
    if (menuOpen) {
      firstNavigationLinkRef.current?.focus();
    }
  }, [menuOpen]);

  useEffect(() => {
    if (menuOpen || !pendingDestination) {
      return undefined;
    }

    const destination = pendingDestination;
    const animationFrame = window.requestAnimationFrame(() => {
      focusDestination(destination);
      setPendingDestination((current) =>
        current === destination ? null : current,
      );
    });

    return () => window.cancelAnimationFrame(animationFrame);
  }, [menuOpen, pendingDestination]);

  const toggleTheme = () => {
    const nextTheme: Theme = theme === "dark" ? "light" : "dark";

    applyTheme(nextTheme);
    setTheme(nextTheme);

    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
    } catch {
      // A blocked storage API must not prevent the in-page theme change.
    }
  };

  const selectDestination = (href: string) => {
    if (!menuOpen) {
      return;
    }

    setMenuOpen(false);
    setPendingDestination(href);
  };

  return (
    <>
      <a className={styles.skipLink} href="#main-content">
        Skip to main content
      </a>
      <header className={styles.header}>
        <div className={styles.inner}>
          <a
            aria-label={`${profile.name} home`}
            className={styles.brand}
            href="#main-content"
          >
            {profile.name}
          </a>

          <nav
            aria-label="Primary navigation"
            className={styles.navigation}
            data-open={menuOpen}
          >
            <ul
              className={styles.navigationList}
              data-open={menuOpen}
              id="primary-navigation-links"
            >
              {navigationItems.map((item, index) => (
                <li key={item.href}>
                  <a
                    className={styles.navigationLink}
                    href={item.href}
                    onClick={() => selectDestination(item.href)}
                    ref={index === 0 ? firstNavigationLinkRef : undefined}
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className={styles.controls}>
            <button
              aria-controls="primary-navigation-links"
              aria-expanded={menuOpen}
              aria-label={menuOpen ? "Close navigation" : "Open navigation"}
              className={styles.menuButton}
              onClick={() => setMenuOpen((open) => !open)}
              ref={menuButtonRef}
              type="button"
            >
              <span aria-hidden="true">{menuOpen ? "×" : "☰"}</span>
            </button>
            <button
              aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
              className={styles.themeButton}
              onClick={toggleTheme}
              type="button"
            >
              <span aria-hidden="true">{theme === "dark" ? "☀" : "☾"}</span>
            </button>
          </div>
        </div>
      </header>
    </>
  );
}
