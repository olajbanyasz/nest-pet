import { defineConfig } from '@playwright/test';
import path from 'path';

import baseConfig from './playwright.config';

export default defineConfig({
  ...baseConfig,
  testDir: './tests/real',
  webServer: [
    {
      command: 'npm run start:dev',
      cwd: path.resolve(__dirname, '..'),
      env: { ...process.env, PORT: '3001' },
      port: 3001,
      reuseExistingServer: !process.env.CI,
      timeout: 120 * 1000,
    },
    {
      command: 'npm start',
      cwd: __dirname,
      env: { ...process.env, PORT: '8000' },
      port: 8000,
      reuseExistingServer: !process.env.CI,
      timeout: 120 * 1000,
    },
  ],
});
