import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  use: {
    baseURL: 'http://localhost:5173',
    headless: true,
    screenshot: 'only-on-failure',
    video: 'on', 
    trace: 'retain-on-failure',
  },
  reporter: [['html', { open: 'never' }]],
});
