import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './tests/phone',
  timeout: 120_000,
  fullyParallel: false,
  retries: 0,
  reporter: [['list'], ['html', { outputFolder: 'playwright-report-phone' }]],
  use: {
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
})
