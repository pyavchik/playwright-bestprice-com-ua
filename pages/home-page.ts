import type { Locator, Page } from '@playwright/test';
import { BasePage } from './base-page';
import { HeaderComponent } from './header-component';
import { FooterComponent } from './footer-component';

export class HomePage extends BasePage {
  readonly path = '/';
  readonly header: HeaderComponent;
  readonly footer: FooterComponent;
  readonly promoRegion: Locator;
  readonly featuredHeading: Locator;
  /** Per-card add-to-cart icon buttons rendered in the "Найкращі пропозиції" grid. */
  readonly addToCartButtons: Locator;

  constructor(page: Page) {
    super(page);
    this.header = new HeaderComponent(page);
    this.footer = new FooterComponent(page);
    this.promoRegion = page.getByRole('region', { name: /промо-банери/i }).first();
    this.featuredHeading = page
      .getByRole('heading', { name: /найкращі пропозиції|популярн/i })
      .first();
    // Every visible product card on the homepage exposes a "Додати в кошик" icon button —
    // counting them is equivalent to counting cards, without an XPath ancestor walk.
    this.addToCartButtons = page.locator('main').getByRole('button', { name: /^додати в кошик$/i });
  }

  /** Backwards-compatible alias kept so existing tests can keep calling `.productCards`. */
  get productCards(): Locator {
    return this.addToCartButtons;
  }
}
