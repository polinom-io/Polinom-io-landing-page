import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: "line",
  use: {
    baseURL: "http://localhost:4321",
    trace: "on-first-retry",
  },
  webServer: {
    // `astro preview` self-detaches into the background whenever Astro 7
    // detects an AI coding agent, with no documented way to opt out — which
    // breaks Playwright's webServer, since it expects this command to stay
    // in the foreground until the port is ready. `astro dev` has the same
    // auto-background behavior but does respect ASTRO_DEV_BACKGROUND=0, so
    // tests run against the dev server instead of a production build.
    command: "ASTRO_DEV_BACKGROUND=0 npm run dev -- --port 4321",
    url: "http://localhost:4321",
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});
