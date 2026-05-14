import type { Locator, Page } from '@playwright/test';
import { BasePage } from './base-page';

/**
 * Note: BestPrice does not expose a separate `/checkout` route — the cart page itself
 * has the "Оформити замовлення" CTA, which opens an inline checkout panel. The locators
 * here cover the form fields seen in the registration-style flow; tests that depend on
 * the checkout reaching a real form skip when the form is not rendered.
 */
export class CheckoutPage extends BasePage {
  readonly path = '/koshyk';
  readonly nameInput: Locator;
  readonly emailInput: Locator;
  readonly phoneInput: Locator;
  readonly cityInput: Locator;
  readonly addressInput: Locator;
  readonly deliveryOptions: Locator;
  readonly paymentOptions: Locator;
  readonly orderSummary: Locator;
  readonly submitButton: Locator;
  readonly validationErrors: Locator;

  constructor(page: Page) {
    super(page);
    const byIdOrName = (key: string, label: RegExp) =>
      page
        .locator(`input#${key}, input[name="${key}"]`)
        .or(page.getByLabel(label))
        .or(page.getByPlaceholder(label))
        .first();

    this.nameInput = byIdOrName('name', /ім'я|name/i);
    this.emailInput = byIdOrName('email', /email|e-mail/i);
    this.phoneInput = byIdOrName('phone', /телефон|phone/i);
    this.cityInput = byIdOrName('city', /місто|city/i);
    this.addressInput = byIdOrName('address', /адрес|вулиц|address/i);
    this.deliveryOptions = page.getByText(/доставк|нова пошта/i).first();
    this.paymentOptions = page.getByText(/оплат|payment/i).first();
    this.orderSummary = page
      .locator('main')
      .getByText(/разом|до сплати/i)
      .first();
    this.submitButton = page.getByRole('button', { name: /оформити|підтверд|замовити/i }).first();
    this.validationErrors = page.locator(
      'main [class*="error" i], main [role="alert"], main [class*="destructive" i]',
    );
  }

  async fillCustomerInfo(user: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    city: string;
    address: string;
  }): Promise<void> {
    const fill = async (loc: Locator, value: string) => {
      if ((await loc.count()) === 0) return;
      if (!(await loc.isVisible().catch(() => false))) return;
      await loc.fill(value);
    };
    await fill(this.nameInput, `${user.firstName} ${user.lastName}`.trim());
    await fill(this.emailInput, user.email);
    await fill(this.phoneInput, user.phone);
    await fill(this.cityInput, user.city);
    await fill(this.addressInput, user.address);
  }

  async submit(): Promise<void> {
    await this.submitButton.click();
  }
}
