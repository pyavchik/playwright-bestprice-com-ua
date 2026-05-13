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
  readonly productCards: Locator;
  readonly productLinks: Locator;
  readonly addToCartButtons: Locator;

  constructor(page: Page) {
    super(page);
    this.header = new HeaderComponent(page);
    this.heading = page.locator('main h1').first();
    this.breadcrumbs = page.getByRole('navigation', { name: /breadcrumb/i }).first();
    this.productLinks = page.locator('main a[href^="/produkt/"]');
    this.addToCartButtons = page.locator('main button[aria-label="Додати в кошик"]');
    // Card container — each "add to cart" button has an ancestor that includes the product link.
    this.productCards = this.addToCartButtons.locator(
      'xpath=ancestor::*[.//a[contains(@href,"/produkt/")]][1]',
    );
  }

  firstProductCard(): Locator {
    return this.productCards.first();
  }

  async openFirstProduct(): Promise<void> {
    await this.productLinks.first().click();
  }
}
