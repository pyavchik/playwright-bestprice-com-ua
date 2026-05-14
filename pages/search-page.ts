import type { Locator, Page } from '@playwright/test';
import { BasePage } from './base-page';
import { HeaderComponent } from './header-component';

export class SearchPage extends BasePage {
  readonly path = '/poshuk';
  readonly header: HeaderComponent;
  readonly heading: Locator;
  /** Visible /produkt/ links in the search results region. */
  readonly resultLinks: Locator;
  /** H2 titles of result cards. */
  readonly resultTitles: Locator;
  /** Price spans (text contains ₴). */
  readonly resultPrices: Locator;
  /** Per-card "Додати в кошик" icon buttons. */
  readonly addToCartButtons: Locator;
  /** Shortcut for the first add-to-cart button. */
  readonly firstAddToCartButton: Locator;
  readonly emptyState: Locator;

  constructor(page: Page) {
    super(page);
    const main = page.locator('main');
    this.header = new HeaderComponent(page);
    this.heading = main.locator('h1').first();
    this.resultLinks = main.locator('a[href^="/produkt/"]');
    this.resultTitles = main.locator('a[href^="/produkt/"] h2');
    this.resultPrices = main.locator('span').filter({ hasText: /₴/ });
    this.addToCartButtons = main.getByRole('button', { name: /^додати в кошик$/i });
    this.firstAddToCartButton = this.addToCartButtons.first();
    this.emptyState = main.getByText(/нічого не знайдено/i).first();
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
