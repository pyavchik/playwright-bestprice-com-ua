import type { Page, ConsoleMessage } from '@playwright/test';

export interface ConsoleEntry {
  type: string;
  text: string;
  url?: string;
}

const NON_CRITICAL_PATTERNS: RegExp[] = [
  /favicon\.ico/i,
  /google-analytics|googletagmanager|gtag|gtm\.js/i,
  /facebook\.net|fbevents/i,
  /yandex|mc\.yandex/i,
  /hotjar/i,
  /doubleclick/i,
  /Failed to load resource.*the server responded with a status of 4\d\d/i,
  /ResizeObserver loop limit exceeded/i,
  /Non-Error promise rejection captured/i,
  // Next.js / React SSR hydration warnings — not functional failures.
  /Minified React error #41[8-9]/i,
  /Minified React error #42[0-5]/i,
  /Hydration failed/i,
  /Text content does not match server-rendered HTML/i,
  // Browser-emitted cookie/CORS warnings that surface as errors in Firefox/WebKit.
  /Cookie [^"]+ has been rejected/i,
  /Cookie .*will be soon rejected/i,
  /Partitioned cookie/i,
  /Cross-Origin Request Blocked/i,
  /Source map error/i,
  /due to access control checks/i,
  /Script .*\/sw\.js load failed/i,
  /ServiceWorker .*registration failed/i,
  // Transient chunk loading failures from CDN — common on first load over flaky links.
  /ChunkLoadError/i,
  /Loading chunk \d+ failed/i,
];

export class ConsoleLogger {
  private entries: ConsoleEntry[] = [];

  attach(page: Page): void {
    page.on('console', (msg: ConsoleMessage) => {
      if (msg.type() === 'error' || msg.type() === 'warning') {
        this.entries.push({
          type: msg.type(),
          text: msg.text(),
          url: msg.location()?.url,
        });
      }
    });

    page.on('pageerror', (err) => {
      this.entries.push({
        type: 'pageerror',
        text: err.message,
      });
    });
  }

  getErrors(): ConsoleEntry[] {
    return this.entries.filter((e) => e.type === 'error' || e.type === 'pageerror');
  }

  getCriticalErrors(): ConsoleEntry[] {
    return this.getErrors().filter((entry) => {
      const haystack = `${entry.text} ${entry.url ?? ''}`;
      return !NON_CRITICAL_PATTERNS.some((pattern) => pattern.test(haystack));
    });
  }

  getAll(): ConsoleEntry[] {
    return [...this.entries];
  }

  clear(): void {
    this.entries = [];
  }
}
