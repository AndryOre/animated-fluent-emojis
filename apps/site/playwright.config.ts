import { defineConfig, devices } from '@playwright/test'

/**
 * Runs the browser specs against the site as the container serves it (nginx).
 * Start the container first and point `SITE_URL` at it.
 */
export default defineConfig({
  testDir: './e2e',
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? [['html', { open: 'never' }]] : 'list',
  use: { baseURL: process.env.SITE_URL ?? 'http://127.0.0.1:8080' },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
})
