import type { Locator, Page } from '@playwright/test';

export class FooterComponent {
  readonly root: Locator;
  readonly phoneLinks: Locator;
  readonly emailLinks: Locator;
  readonly callbackButton: Locator;

  constructor(private readonly page: Page) {
    this.root = page.locator('footer').first();
    this.phoneLinks = this.root.locator('a[href^="tel:"]');
    this.emailLinks = this.root.locator('a[href^="mailto:"]');
    this.callbackButton = this.root.getByRole('button', { name: /замовити дзвінок/i });
  }

  link(name: RegExp | string): Locator {
    return this.root.getByRole('link', { name });
  }
}
