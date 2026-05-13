import type { Locator, Page } from '@playwright/test';
import { BasePage } from './base-page';

export class LoginPage extends BasePage {
  readonly path = '/vkhid';
  readonly heading: Locator;
  readonly identifierInput: Locator;
  readonly passwordInput: Locator;
  readonly submitButton: Locator;
  readonly registerLink: Locator;
  readonly validationErrors: Locator;

  constructor(page: Page) {
    super(page);
    this.heading = page.locator('main [data-slot="card-title"]').first();
    this.identifierInput = page.locator('input#identifier');
    this.passwordInput = page.locator('input#password');
    this.submitButton = page.getByRole('button', { name: /^увійти$/i });
    this.registerLink = page.getByRole('link', { name: /зареєструватися|реєстр/i });
    this.validationErrors = page.locator(
      'main [class*="error" i], main [role="alert"], main [class*="destructive" i]',
    );
  }

  async login(identifier: string, password: string): Promise<void> {
    await this.identifierInput.fill(identifier);
    await this.passwordInput.fill(password);
    await this.submitButton.click();
  }

  async submitEmpty(): Promise<void> {
    await this.identifierInput.fill('');
    await this.passwordInput.fill('');
    await this.submitButton.click();
  }
}
