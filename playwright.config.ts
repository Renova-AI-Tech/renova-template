import { defineConfig, devices } from '@playwright/test';

const baseURL = process.env.FRONTEND_URL;
const backendPort = process.env.PORT;
if (!baseURL || !backendPort || process.env.NODE_ENV !== 'test') {
  throw new Error('Use pnpm test:e2e para provisionar um banco e portas exclusivos de teste.');
}

function loopbackPort(value: string, label: string): number {
  if (!/^[1-9]\d{0,4}$/.test(value) || Number(value) > 65535) {
    throw new Error(`Invalid ${label}`);
  }
  return Number(value);
}

const frontend = new URL(baseURL);
if (frontend.hostname !== '127.0.0.1' || frontend.protocol !== 'http:') {
  throw new Error('FRONTEND_URL must be http://127.0.0.1:<port>');
}
const frontendPort = loopbackPort(frontend.port, 'FRONTEND_URL');
const apiPort = loopbackPort(backendPort, 'PORT');

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 30_000,
  expect: { timeout: 5_000 },
  fullyParallel: false,
  retries: 0,
  workers: 1,
  reporter: [['list']],
  use: {
    baseURL,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'off',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: [
    {
      command: 'node apps/backend/dist/index.js',
      url: `http://127.0.0.1:${apiPort}/health`,
      reuseExistingServer: false,
      gracefulShutdown: { signal: 'SIGTERM', timeout: 5000 },
      timeout: 60_000,
    },
    {
      command: `pnpm --filter @renova/frontend exec vite preview --host 127.0.0.1 --strictPort --port ${frontendPort}`,
      url: baseURL,
      reuseExistingServer: false,
      gracefulShutdown: { signal: 'SIGTERM', timeout: 5000 },
      timeout: 60_000,
    },
  ],
});
