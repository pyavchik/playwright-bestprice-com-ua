import { test, expect } from '../fixtures/pages-fixture';
import { searchTerms } from '../test-data/search-terms';
import { env } from '../utils/env';

/**
 * BestPrice exposes checkout via the cart page's "Оформити замовлення" CTA, not a
 * separate /checkout route. These tests assert the CTA is reachable and refuse to
 * submit a real order against production (TEST_MODE=false).
 */
test.describe('@regression @checkout Checkout', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await page.evaluate(() => {
      try {
        window.localStorage.clear();
        window.sessionStorage.clear();
      } catch {
        // ignore
      }
    });
  });

  test('Checkout CTA is exposed only when cart has items', async ({ cartPage }) => {
    await cartPage.goto();
    await expect(cartPage.emptyState).toBeVisible();
    // Empty cart should not present a checkout CTA.
    expect(await cartPage.checkoutButton.count()).toBe(0);
  });

  test('Checkout CTA appears once a product is added to cart', async ({
    page,
    homePage,
    searchPage,
    cartPage,
  }) => {
    await homePage.header.search(searchTerms.valid[0]);
    await expect.poll(() => searchPage.resultsCount(), { timeout: 15_000 }).toBeGreaterThan(0);
    await searchPage.results.first().locator('button[aria-label="Додати в кошик"]').click();
    await expect.poll(() => homePage.header.getCartCount(), { timeout: 10_000 }).toBe(1);

    await page.goto('/koshyk', { waitUntil: 'domcontentloaded' });
    await expect(cartPage.checkoutButton).toBeVisible({ timeout: 10_000 });

    // SAFETY: never submit a real production order unless TEST_MODE=true.
    if (env.testMode) {
      await cartPage.goToCheckout();
    } else {
      test.info().annotations.push({
        type: 'safety',
        description: 'TEST_MODE=false — stopped before clicking checkout submit',
      });
    }
  });
});
