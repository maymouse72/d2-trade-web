import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  fullyParallel: false,
  reporter: "list",
  use: {
    baseURL: "http://127.0.0.1:4173",
    channel: "chrome",
    headless: true,
    trace: "retain-on-failure",
  },
  projects: [
    { name: "desktop-chrome", use: { viewport: { width: 1365, height: 900 } } },
    { name: "mobile-chrome-390x844", use: { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true } },
  ],
  webServer: {
    command: "npm run start -- --hostname 127.0.0.1 --port 4173",
    url: "http://127.0.0.1:4173/game-info/ias-calculator",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
