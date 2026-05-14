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
  readonly productCards: Locator;

  constructor(page: Page) {
    super(page);
    this.header = new HeaderComponent(page);
    this.footer = new FooterComponent(page);
    this.promoRegion = page.getByRole('region', { name: /промо-банери/i }).first();
    this.featuredHeading = page
      .getByRole('heading', { name: /найкращі пропозиції|популярн/i })
      .first();
    // A product card is any container with both a /produkt/ link and the "Додати в кошик" button.
    this.productCards = page
      .locator('button[aria-label="Додати в кошик"]')
      .locator('xpath=ancestor::*[.//a[contains(@href,"/produkt/")]][1]');
  }
}
