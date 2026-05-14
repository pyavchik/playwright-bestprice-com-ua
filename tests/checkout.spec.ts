import { test, expect } from '../fixtures/pages-fixture';
import { allureMeta, step } from '../utils/allure';
import { searchTerms } from '../test-data/search-terms';
import { env } from '../utils/env';

const EPIC = 'Checkout';
const FEATURE = 'Cart checkout entry point';

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
    await allureMeta({
      epic: EPIC,
      feature: FEATURE,
      story: 'No checkout button when cart is empty',
      description:
        'Opens /koshyk with an empty cart and asserts that the "Оформити замовлення" CTA is absent. ' +
        'The button should only appear once there is at least one line item.',
      severity: 'normal',
    });

    await step('Open empty cart', () => cartPage.goto());
    await step('Empty state visible', () => expect(cartPage.emptyState).toBeVisible());
    await step('No checkout CTA', async () =>
      expect(await cartPage.checkoutButton.count()).toBe(0),
    );
  });

  test('Checkout CTA appears once a product is added to cart', async ({
    page,
    homePage,
    searchPage,
    cartPage,
  }) => {
    await allureMeta({
      epic: EPIC,
      feature: FEATURE,
      story: 'Checkout CTA appears for non-empty carts',
      description:
        'After adding a product, the cart page must surface a visible "Оформити замовлення" CTA. ' +
        'Production safety: the test never submits a real order — it only clicks checkout when ' +
        'TEST_MODE=true, otherwise it stops at the CTA assertion.',
      severity: 'critical',
      tags: ['safety'],
    });

    await step('Search and add a product', async () => {
      await homePage.header.search(searchTerms.valid[0]);
      await expect.poll(() => searchPage.resultsCount(), { timeout: 15_000 }).toBeGreaterThan(0);
      await searchPage.results.first().locator('button[aria-label="Додати в кошик"]').click();
      await expect.poll(() => homePage.header.getCartCount(), { timeout: 10_000 }).toBe(1);
    });
    await step('Open cart', () => page.goto('/koshyk', { waitUntil: 'domcontentloaded' }));
    await step('Checkout CTA is visible', () =>
      expect(cartPage.checkoutButton).toBeVisible({ timeout: 10_000 }),
    );

    if (env.testMode) {
      await step('TEST_MODE=true — click checkout', () => cartPage.goToCheckout());
    } else {
      test.info().annotations.push({
        type: 'safety',
        description: 'TEST_MODE=false — stopped before clicking checkout submit',
      });
    }
  });
});
