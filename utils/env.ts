import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

export const env = {
  baseUrl: process.env.BASE_URL ?? 'https://bestprice.com.ua',
  testMode: (process.env.TEST_MODE ?? 'false').toLowerCase() === 'true',
  isCI: !!process.env.CI,
  userEmail: process.env.USER_EMAIL ?? '',
  userPassword: process.env.USER_PASSWORD ?? '',
} as const;
