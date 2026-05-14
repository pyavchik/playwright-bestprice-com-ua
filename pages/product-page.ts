import type { Locator, Page } from '@playwright/test';
import { BasePage } from './base-page';
import { HeaderComponent } from './header-component';

export class ProductPage extends BasePage {
  /** Product pages have dynamic slugs (/produkt/<slug>); navigation happens via listings. */
  readonly path = '/';

  readonly header: HeaderComponent;
  readonly title: Locator;
  readonly image: Locator;
  /** The main (large) price element. Page also renders related-products prices. */
  readonly price: Locator;
  readonly availability: Locator;
  /** Primary add-to-cart action — the prominent text button. */
  readonly addToCartButton: Locator;
  readonly description: Locator;
  readonly breadcrumbs: Locator;
  readonly sku: Locator;

  constructor(page: Page) {
    super(page);
    this.header = new HeaderComponent(page);
    this.title = page.locator('main h1').first();
    this.image = page.locator('main img').first();
    this.price = page.locator('main span.text-2xl').filter({ hasText: /₴/ }).first();
    this.availability = page
      .locator('main')
      .getByText(/в наявності|немає в наявн|залишилось/i)
      .first();
    this.addToCartButton = page
      .locator('main')
      .getByRole('button', { name: /^додати в кошик$/i })
      .first();
    this.description = page
      .locator('main')
      .getByText(/опис|характеристик/i)
      .first();
    this.breadcrumbs = page.getByRole('navigation', { name: /breadcrumb/i }).first();
    this.sku = page
      .locator('main')
      .getByText(/арт[:\s]/i)
      .first();
  }

  async addToCart(): Promise<void> {
    await this.addToCartButton.click();
  }

  async getTitleText(): Promise<string> {
    return ((await this.title.textContent()) ?? '').trim();
  }

  async getPriceText(): Promise<string> {
    return ((await this.price.textContent()) ?? '').trim();
  }
}
