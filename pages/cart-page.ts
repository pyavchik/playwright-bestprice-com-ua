import type { Locator, Page } from '@playwright/test';
import { BasePage } from './base-page';
import { HeaderComponent } from './header-component';

export class CartPage extends BasePage {
  readonly path = '/koshyk';
  readonly header: HeaderComponent;
  readonly heading: Locator;
  readonly emptyState: Locator;
  /** Each cart line item — derived from the per-item remove button's ancestor. */
  readonly items: Locator;
  readonly itemLinks: Locator;
  readonly quantityInputs: Locator;
  readonly increaseButtons: Locator;
  readonly decreaseButtons: Locator;
  readonly removeButtons: Locator;
  readonly clearCartButton: Locator;
  readonly checkoutButton: Locator;
  readonly continueShoppingLink: Locator;
  readonly totalAmount: Locator;

  constructor(page: Page) {
    super(page);
    this.header = new HeaderComponent(page);
    this.heading = page.getByRole('heading', { level: 1, name: /^кошик$/i });
    this.emptyState = page.getByText(/ваш кошик порожній/i).first();
    this.removeButtons = page.locator('main button[aria-label="Видалити з кошика"]');
    this.items = this.removeButtons.locator(
      'xpath=ancestor::*[.//a[contains(@href,"/produkt/")]][1]',
    );
    this.itemLinks = page.locator('main a[href^="/produkt/"]');
    this.quantityInputs = page.locator('main input[aria-label="Кількість товару"]');
    this.increaseButtons = page.locator('main button[aria-label="Збільшити кількість"]');
    this.decreaseButtons = page.locator('main button[aria-label="Зменшити кількість"]');
    this.clearCartButton = page.getByRole('button', { name: /очистити кошик/i });
    this.checkoutButton = page
      .getByRole('button', { name: /оформити замовлення/i })
      .or(page.getByRole('link', { name: /оформити замовлення/i }))
      .first();
    this.continueShoppingLink = page.getByRole('link', { name: /продовжити покупки/i });
    // The "Разом:" total label is followed in the DOM by the amount in the same container.
    this.totalAmount = page
      .locator('main')
      .getByText(/разом/i)
      .locator('xpath=ancestor::*[self::div or self::section][1]')
      .first();
  }

  firstItem(): Locator {
    return this.items.first();
  }

  async itemCount(): Promise<number> {
    return this.items.count();
  }

  async setQuantity(index: number, value: number): Promise<void> {
    const input = this.quantityInputs.nth(index);
    await input.fill(value.toString());
    await input.press('Enter');
  }

  async increaseQuantity(index = 0): Promise<void> {
    await this.increaseButtons.nth(index).click();
  }

  async decreaseQuantity(index = 0): Promise<void> {
    await this.decreaseButtons.nth(index).click();
  }

  async removeItem(index = 0): Promise<void> {
    await this.removeButtons.nth(index).click();
  }

  async getTotalText(): Promise<string> {
    if ((await this.totalAmount.count()) === 0) return '';
    return ((await this.totalAmount.first().textContent()) ?? '').trim();
  }

  async goToCheckout(): Promise<void> {
    await this.checkoutButton.click();
  }

  async clear(): Promise<void> {
    if ((await this.clearCartButton.count()) === 0) return;
    if (!(await this.clearCartButton.first().isVisible().catch(() => false))) return;
    await this.clearCartButton.first().click();
  }
}
