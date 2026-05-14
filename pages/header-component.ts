import type { Locator, Page } from '@playwright/test';

export class HeaderComponent {
  readonly root: Locator;
  readonly logo: Locator;
  readonly searchInput: Locator;
  readonly searchSubmit: Locator;
  readonly catalogButton: Locator;
  readonly cartButton: Locator;
  readonly loginLink: Locator;
  readonly mobileMenuToggle: Locator;
  readonly mobileNav: Locator;
  readonly mobileCartLink: Locator;

  constructor(private readonly page: Page) {
    this.root = page.locator('header').first();
    this.logo = this.root.getByRole('link', { name: /best\s*price/i }).first();
    // Header has its own search; the chat assistant also has an input. Restrict to header.
    this.searchInput = this.root.getByRole('combobox', { name: /пошук/i }).first();
    this.searchSubmit = this.root.getByRole('button', { name: /знайти/i }).first();
    this.catalogButton = this.root.getByRole('button', { name: /каталог/i }).first();
    // Desktop cart is a button that opens the cart page/drawer; mobile nav has a link.
    this.cartButton = this.root.getByRole('button', { name: /^кошик(,.*)?$/i }).first();
    this.loginLink = this.root.getByRole('link', { name: /^увійти$/i }).first();
    this.mobileMenuToggle = page.getByRole('button', { name: /відкрити меню/i }).first();
    this.mobileNav = page.getByRole('navigation', { name: /мобільна навігація/i });
    this.mobileCartLink = this.mobileNav.getByRole('link', { name: /кошик/i }).first();
  }

  async search(term: string): Promise<void> {
    await this.searchInput.click();
    await this.searchInput.fill(term);
    // Header search is a combobox; pressing Enter on the input submits the form.
    // Race: on slow runners the navigation can be in flight while a fallback
    // page.goto() fires, producing "Navigation interrupted by another navigation".
    // Subscribe to navigation BEFORE pressing Enter, then await both together.
    const target = `/poshuk?q=${encodeURIComponent(term.trim())}`;
    const navigated = this.page
      .waitForURL(/\/poshuk(\?|$)/, { timeout: 15_000 })
      .then(() => true)
      .catch(() => false);
    await this.searchInput.press('Enter');
    if (!(await navigated) && !/\/poshuk(\?|$)/.test(this.page.url())) {
      // Enter genuinely didn't submit — navigate directly.
      await this.page.goto(target, { waitUntil: 'domcontentloaded' });
    }
    // The autocomplete listbox can linger on Firefox/WebKit after navigation and
    // intercept clicks on result cards. Dismiss it before returning.
    await this.dismissSearchDropdown();
  }

  /** Close the search autocomplete dropdown if still open. */
  async dismissSearchDropdown(): Promise<void> {
    const dropdownOption = this.page.locator('[role="option"]').first();
    const hasOpenDropdown = async () =>
      (await dropdownOption.count()) > 0 && (await dropdownOption.isVisible().catch(() => false));

    if (!(await hasOpenDropdown())) return;

    // Try several dismissal strategies; each is harmless on its own.
    await this.searchInput.press('Escape').catch(() => undefined);
    if (!(await hasOpenDropdown())) return;

    await this.page
      .evaluate(() => (document.activeElement as HTMLElement | null)?.blur())
      .catch(() => undefined);
    if (!(await hasOpenDropdown())) return;

    // Click on a definitely-non-overlay element below the fold.
    await this.page
      .locator('footer')
      .first()
      .scrollIntoViewIfNeeded()
      .catch(() => undefined);
    await this.page.mouse.click(10, 10).catch(() => undefined);
    await dropdownOption.waitFor({ state: 'hidden', timeout: 5_000 }).catch(() => undefined);
  }

  async openCatalog(): Promise<void> {
    await this.catalogButton.click();
  }

  /**
   * Navigate to the cart page. Desktop header exposes a button that opens a drawer or
   * navigates; mobile nav has a direct link. Falls back to a direct navigation to /koshyk
   * for stability across breakpoints.
   */
  async openCart(): Promise<void> {
    if (await this.mobileCartLink.isVisible().catch(() => false)) {
      await this.mobileCartLink.click();
      return;
    }
    await this.page.goto('/koshyk', { waitUntil: 'domcontentloaded' });
  }

  async openLogin(): Promise<void> {
    await this.loginLink.click();
  }

  async openMobileMenu(): Promise<void> {
    await this.mobileMenuToggle.click();
  }

  /**
   * Cart count is exposed in several places:
   *   - desktop button aria-label: "Кошик" (empty) or "Кошик, N товарів"
   *   - mobile link aria-label: same pattern
   *   - cart drawer dialog heading: "Кошик (N)" (only when the drawer is open)
   * Read any of these to derive the count.
   */
  async getCartCount(): Promise<number> {
    const drawerHeading = this.page
      .getByRole('heading', { level: 2, name: /^кошик\s*\(\d+\)/i })
      .first();
    if ((await drawerHeading.count()) > 0) {
      const text = (await drawerHeading.textContent()) ?? '';
      const match = text.match(/\((\d+)\)/);
      if (match) return Number(match[1]);
    }

    for (const candidate of [this.cartButton, this.mobileCartLink]) {
      if ((await candidate.count()) === 0) continue;
      const label = await candidate.getAttribute('aria-label').catch(() => null);
      const text = label ?? (await candidate.textContent().catch(() => '')) ?? '';
      const match = text.match(/(\d+)\s*товар/i);
      if (match) return Number(match[1]);
    }
    return 0;
  }
}
