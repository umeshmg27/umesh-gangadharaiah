export type Theme = "dark" | "light";

export const THEME_STORAGE_KEY = "portfolio-theme";

export function resolveInitialTheme(
  stored: string | null,
  prefersLight: boolean,
): Theme {
  if (stored === "dark" || stored === "light") {
    return stored;
  }

  return prefersLight ? "light" : "dark";
}

export function applyTheme(theme: Theme): void {
  document.documentElement.dataset.theme = theme;
  document.documentElement.style.colorScheme = theme;
}
