import { defineConfig, devices } from '@playwright/test';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(__dirname, '.env') });

const BASE_URL = process.env.BASE_URL ?? 'https://bestprice.com.ua';
const isCI = !!process.env.CI;

// By default only Chromium runs. Set ALL_BROWSERS=true (or pass --project=...)
// to include Firefox, WebKit and the mobile emulations.
const allBrowsers = (process.env.ALL_BROWSERS ?? '').toLowerCase() === 'true';

const allProjects = [
  {
    name: 'chromium',
    use: { ...devices['Desktop Chrome'] },
    grepInvert: /@mobile/,
  },
  {
    name: 'firefox',
    use: { ...devices['Desktop Firefox'] },
    grepInvert: /@mobile/,
  },
  {
    name: 'webkit',
    use: { ...devices['Desktop Safari'] },
    grepInvert: /@mobile/,
  },
  {
    name: 'mobile-chrome',
    use: { ...devices['Pixel 7'] },
    grep: /@mobile/,
  },
  {
    name: 'mobile-safari',
    use: { ...devices['iPhone 14'] },
    grep: /@mobile/,
  },
];

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: isCI,
  // One local retry absorbs transient network/CDN flakiness against the live site
  // without masking real bugs; CI runs with two retries.
  retries: isCI ? 2 : 1,
  workers: isCI ? 2 : undefined,
  timeout: 60_000,
  expect: {
    timeout: 10_000,
  },
  reporter: [
    ['list'],
    ['html', { open: 'never', outputFolder: 'playwright-report' }],
    ['junit', { outputFile: 'test-results/junit.xml' }],
  ],
  outputDir: 'test-results/artifacts',
  use: {
    baseURL: BASE_URL,
    actionTimeout: 15_000,
    navigationTimeout: 45_000,
    ignoreHTTPSErrors: true,
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'retain-on-failure',
    locale: 'uk-UA',
    timezoneId: 'Europe/Kyiv',
    extraHTTPHeaders: {
      'Accept-Language': 'uk-UA,uk;q=0.9,en;q=0.8',
    },
  },
  projects: allBrowsers ? allProjects : allProjects.filter((p) => p.name === 'chromium'),
});
