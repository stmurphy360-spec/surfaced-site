// E2E Test Suite — manual / on-demand only (not wired to CI)
// Full run costs real OpenAI + Anthropic API calls (~10 min)
// Command: cd surfaced-site && npx playwright test --config playwright.e2e.config.ts
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: false,
  retries: 0,
  reporter: 'html',
  timeout: 60_000,
  use: {
    baseURL: 'https://getsurfaced.app',
    trace: 'on-first-retry',
    actionTimeout: 15_000,
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
})
