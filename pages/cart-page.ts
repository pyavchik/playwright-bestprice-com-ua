import type { Locator, Page } from '@playwright/test';
import { BasePage } from './base-page';
import { HeaderComponent } from './header-component';

export class CartPage extends BasePage {
  readonly path = '/koshyk';
  readonly header: HeaderComponent;
  readonly heading: Locator;
  readonly emptyState: Locator;
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
    const main = page.locator('main');
    this.header = new HeaderComponent(page);
    this.heading = page.getByRole('heading', { level: 1, name: /^кошик$/i });
    this.emptyState = main.getByText(/ваш кошик порожній/i).first();
    this.itemLinks = main.locator('a[href^="/produkt/"]');
    this.quantityInputs = main.getByRole('spinbutton', { name: /кількість товару/i });
    this.increaseButtons = main.getByRole('button', { name: /збільшити кількість/i });
    this.decreaseButtons = main.getByRole('button', { name: /зменшити кількість/i });
    this.removeButtons = main.getByRole('button', { name: /видалити з кошика/i });
    this.clearCartButton = main.getByRole('button', { name: /очистити кошик/i });
    this.checkoutButton = main
      .getByRole('link', { name: /оформити замовлення/i })
      .or(main.getByRole('button', { name: /оформити замовлення/i }))
      .first();
    this.continueShoppingLink = main.getByRole('link', { name: /продовжити покупки/i });
    // The total label "Разом:" lives next to the amount in a small bottom panel.
    this.totalAmount = main.getByText(/разом\s*:/i).first();
  }

  /**
   * Line-item count. Each item has exactly one "Видалити з кошика" button, so the
   * remove-button count is the canonical item count without an XPath ancestor walk.
   */
  itemCountLocator(): Locator {
    return this.removeButtons;
  }

  async itemCount(): Promise<number> {
    return this.removeButtons.count();
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
}
