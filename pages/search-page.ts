import type { Locator, Page } from '@playwright/test';
import { BasePage } from './base-page';
import { HeaderComponent } from './header-component';

export class SearchPage extends BasePage {
  readonly path = '/poshuk';
  readonly header: HeaderComponent;
  readonly heading: Locator;
  readonly results: Locator;
  readonly resultLinks: Locator;
  readonly resultTitles: Locator;
  readonly resultPrices: Locator;
  readonly emptyState: Locator;

  constructor(page: Page) {
    super(page);
    this.header = new HeaderComponent(page);
    this.heading = page.locator('main h1').first();
    // Result cards = ancestor of the "Додати в кошик" button that includes a /produkt/ link.
    this.resultLinks = page.locator('main a[href^="/produkt/"]');
    this.results = page
      .locator('main button[aria-label="Додати в кошик"]')
      .locator('xpath=ancestor::*[.//a[contains(@href,"/produkt/")]][1]');
    this.resultTitles = page.locator('main a[href^="/produkt/"] h2');
    this.resultPrices = page.locator('main span').filter({ hasText: /₴/ });
    this.emptyState = page.getByText(/нічого не знайдено/i).first();
  }

  async gotoQuery(query: string): Promise<void> {
    await this.page.goto(`${this.path}?q=${encodeURIComponent(query)}`, {
      waitUntil: 'domcontentloaded',
    });
  }

  async resultsCount(): Promise<number> {
    return this.resultTitles.count();
  }
}
