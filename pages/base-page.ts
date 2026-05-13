import type { Locator, Page, Response } from '@playwright/test';

/**
 * Base page object. Concrete page objects extend it and expose
 * meaningful, page-specific locators and actions.
 *
 * Rules:
 * - No assertions in page objects (tests own assertions).
 * - Prefer role/label/text locators over CSS/XPath.
 * - No hard waits (waitForTimeout) — use locator-based awaits.
 */
export abstract class BasePage {
  constructor(readonly page: Page) {}

  /** URL path (relative to baseURL) the page is reachable at. Override per page. */
  abstract readonly path: string;

  async goto(path?: string): Promise<Response | null> {
    return this.page.goto(path ?? this.path, { waitUntil: 'domcontentloaded' });
  }

  async reload(): Promise<Response | null> {
    return this.page.reload({ waitUntil: 'domcontentloaded' });
  }

  async currentUrl(): Promise<string> {
    return this.page.url();
  }

  async getPageTitle(): Promise<string> {
    return this.page.title();
  }

  body(): Locator {
    return this.page.locator('body');
  }

  /**
   * Wait for the network to be roughly idle without using hard waits.
   * Useful after navigation that triggers async loads (lazy lists, etc.).
   */
  async waitForReady(): Promise<void> {
    await this.page.waitForLoadState('domcontentloaded');
  }
}
