import { afterEach, describe, expect, test, vi } from "vitest";

import indexHtml from "../../index.html?raw";
import {
  applyTheme,
  resolveInitialTheme,
  THEME_STORAGE_KEY,
} from "./theme";

function readThemeInitializer(): string {
  const match = indexHtml.match(
    /<script data-theme-initializer>([\s\S]*?)<\/script>/,
  );

  if (!match) {
    throw new Error("Theme initializer script is missing from index.html");
  }

  return match[1];
}

function runThemeInitializer(options: {
  stored: string | null;
  prefersLight?: boolean;
  storageThrows?: boolean;
  matchMediaAvailable?: boolean;
}) {
  const localStorageDescriptor = Object.getOwnPropertyDescriptor(
    window,
    "localStorage",
  );
  const matchMediaDescriptor = Object.getOwnPropertyDescriptor(
    window,
    "matchMedia",
  );
  const getItem = vi.fn(() => {
    if (options.storageThrows) {
      throw new Error("storage unavailable");
    }

    return options.stored;
  });

  Object.defineProperty(window, "localStorage", {
    configurable: true,
    value: { getItem },
  });

  if (options.matchMediaAvailable === false) {
    Reflect.deleteProperty(window, "matchMedia");
  } else {
    Object.defineProperty(window, "matchMedia", {
      configurable: true,
      value: vi.fn(() => ({ matches: options.prefersLight ?? false })),
    });
  }

  delete document.documentElement.dataset.theme;
  document.documentElement.style.colorScheme = "";

  try {
    Function(readThemeInitializer())();

    return {
      getItem,
      theme: document.documentElement.dataset.theme,
      colorScheme: document.documentElement.style.colorScheme,
    };
  } finally {
    if (localStorageDescriptor) {
      Object.defineProperty(window, "localStorage", localStorageDescriptor);
    }

    if (matchMediaDescriptor) {
      Object.defineProperty(window, "matchMedia", matchMediaDescriptor);
    } else {
      Reflect.deleteProperty(window, "matchMedia");
    }
  }
}

afterEach(() => {
  vi.restoreAllMocks();
  delete document.documentElement.dataset.theme;
  document.documentElement.style.colorScheme = "";
});

describe("theme contract", () => {
  test("uses a valid stored preference before the system preference", () => {
    expect(resolveInitialTheme("dark", true)).toBe("dark");
    expect(resolveInitialTheme("light", false)).toBe("light");
  });

  test("uses the light system preference when storage has no valid value", () => {
    expect(resolveInitialTheme(null, true)).toBe("light");
    expect(resolveInitialTheme("unexpected", true)).toBe("light");
  });

  test("falls back to dark without a stored or light system preference", () => {
    expect(resolveInitialTheme(null, false)).toBe("dark");
    expect(resolveInitialTheme("unexpected", false)).toBe("dark");
  });

  test("applies both the theme data attribute and native color scheme", () => {
    applyTheme("light");

    expect(document.documentElement.dataset.theme).toBe("light");
    expect(document.documentElement.style.colorScheme).toBe("light");
  });

  test("uses the same stored, system, and dark priority before React mounts", () => {
    expect(
      runThemeInitializer({ stored: "dark", prefersLight: true }),
    ).toMatchObject({ theme: "dark", colorScheme: "dark" });
    expect(
      runThemeInitializer({ stored: null, prefersLight: true }),
    ).toMatchObject({ theme: "light", colorScheme: "light" });
    expect(
      runThemeInitializer({ stored: null, prefersLight: false }),
    ).toMatchObject({ theme: "dark", colorScheme: "dark" });
  });

  test("initializer tolerates unavailable storage and matchMedia", () => {
    const result = runThemeInitializer({
      stored: null,
      storageThrows: true,
      matchMediaAvailable: false,
    });

    expect(result.getItem).toHaveBeenCalledTimes(1);
    expect(result).toMatchObject({ theme: "dark", colorScheme: "dark" });
    expect(indexHtml).toContain(THEME_STORAGE_KEY);
  });
});
