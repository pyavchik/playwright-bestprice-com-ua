import type { Locator, Page, Response } from '@playwright/test';
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
  readonly productCardEls: Locator;
  readonly discountedPriceBlocks: Locator;
  readonly discountFilterCheckbox: Locator;
  readonly discountFilterLabel: Locator;
  readonly discountFilterChip: Locator;
  readonly totalCounter: Locator;

  constructor(page: Page) {
    super(page);
    const main = page.locator('main');
    this.header = new HeaderComponent(page);
    this.heading = main.locator('h1').first();
    this.breadcrumbs = page.getByRole('navigation', { name: /breadcrumb/i }).first();
    this.productLinks = main.locator('a[href^="/produkt/"]');
    this.addToCartButtons = main.getByRole('button', { name: /^додати в кошик$/i });
    this.productCardEls = main.locator('[data-testid="product-card"]');
    this.discountedPriceBlocks = main.locator('[data-testid="product-card-price-sale"]');
    this.discountFilterCheckbox = page.getByLabel('Показати тільки товари зі знижкою');
    this.discountFilterLabel = page
      .locator('label')
      .filter({ has: page.getByLabel('Показати тільки товари зі знижкою') })
      .first();
    this.discountFilterChip = main
      .getByRole('button', { name: /зі знижкою/i })
      .or(main.locator('text=Зі знижкою'))
      .first();
    this.totalCounter = main.locator('text=/\\d+\\s+товар/').first();
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

  async gotoSlug(slug: string, search = ''): Promise<Response | null> {
    return this.goto(`/kategoriya/${slug}${search}`);
  }

  async readTotalCount(): Promise<number> {
    const text = (await this.totalCounter.textContent()) ?? '';
    const match = text.match(/(\d+)/);
    return match ? Number(match[1]) : 0;
  }
}
