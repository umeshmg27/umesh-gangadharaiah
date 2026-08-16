import { defineConfig } from "@playwright/test";

const baseURL = "http://127.0.0.1:4173/umesh-gangadharaiah/";

export default defineConfig({
  testDir: "./e2e",
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL,
    colorScheme: "dark",
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "phone-390x844",
      use: { viewport: { width: 390, height: 844 } },
    },
    {
      name: "tablet-768x1024",
      use: { viewport: { width: 768, height: 1024 } },
    },
    {
      name: "laptop-1440x900",
      use: { viewport: { width: 1440, height: 900 } },
    },
    {
      name: "wide-1920x1080",
      use: { viewport: { width: 1920, height: 1080 } },
    },
  ],
  webServer: {
    command: "npm run build && npm run preview -- --host 127.0.0.1",
    env: {
      VITE_BLOG_GIST_ID: "0123456789abcdef0123456789abcdef",
    },
    reuseExistingServer: false,
    timeout: 120_000,
    url: baseURL,
  },
});
