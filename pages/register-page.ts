import type { Locator, Page } from '@playwright/test';
import { BasePage } from './base-page';

export class RegisterPage extends BasePage {
  readonly path = '/reyestratsiya';
  readonly heading: Locator;
  readonly nameInput: Locator;
  readonly emailInput: Locator;
  readonly phoneInput: Locator;
  readonly passwordInput: Locator;
  readonly submitButton: Locator;
  readonly validationErrors: Locator;

  constructor(page: Page) {
    super(page);
    this.heading = page.locator('main [data-slot="card-title"]').first();
    this.nameInput = page.locator('input#name, input[name="name"]').first();
    this.emailInput = page.locator('input#email, input[name="email"]').first();
    this.phoneInput = page.locator('input#phone, input[name="phone"]').first();
    this.passwordInput = page.locator('input#password, input[name="password"]').first();
    this.submitButton = page.getByRole('button', { name: /зареєструватися|створити|реєстр/i }).first();
    this.validationErrors = page.locator(
      'main [class*="error" i], main [role="alert"], main [class*="destructive" i]',
    );
  }

  async fill(data: { name: string; email: string; phone: string; password: string }): Promise<void> {
    await this.nameInput.fill(data.name);
    await this.emailInput.fill(data.email);
    await this.phoneInput.fill(data.phone);
    await this.passwordInput.fill(data.password);
  }
}
