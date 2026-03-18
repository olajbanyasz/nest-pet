import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/mock',
  fullyParallel: true,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [['html', { open: 'never' }], ['list']],
  use: {
    baseURL: 'http://127.0.0.1:8001',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'npm start',
    port: 8001,
    reuseExistingServer: false,
    timeout: 120 * 1000,
    env: {
      PORT: '8001',
      BROWSER: 'none',
      REACT_APP_E2E: 'true',
    },
  },
});
