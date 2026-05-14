import type { Locator, Page } from '@playwright/test';
import { BasePage } from './base-page';
import { HeaderComponent } from './header-component';

/**
 * BestPrice does not have a `/catalog` index — categories are exposed via
 * the "Каталог" header button (modal) and via `/kategoriya/<slug>` URLs.
 * This page object covers a category listing page.
 */
export class CatalogPage extends BasePage {
  readonly path = '/kategoriya/pobutova-tehnika';
  readonly header: HeaderComponent;
  readonly heading: Locator;
  readonly breadcrumbs: Locator;
  readonly productLinks: Locator;
  readonly addToCartButtons: Locator;

  constructor(page: Page) {
    super(page);
    const main = page.locator('main');
    this.header = new HeaderComponent(page);
    this.heading = main.locator('h1').first();
    this.breadcrumbs = page.getByRole('navigation', { name: /breadcrumb/i }).first();
    this.productLinks = main.locator('a[href^="/produkt/"]');
    this.addToCartButtons = main.getByRole('button', { name: /^додати в кошик$/i });
  }

  /**
   * Card count is the number of add-to-cart buttons (one per card). Kept as a
   * getter so call sites can use Playwright's web-first matchers like
   * `await expect(catalogPage.productCards).not.toHaveCount(0)`.
   */
  get productCards(): Locator {
    return this.addToCartButtons;
  }

  async openFirstProduct(): Promise<void> {
    await this.productLinks.first().click();
  }
}
