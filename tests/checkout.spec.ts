import { test, expect } from '../fixtures/pages-fixture';
import { allureMeta, step } from '../utils/allure';
import { searchAndAddFirstResultToCart } from '../utils/test-flows';
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
    await step('No checkout CTA', () => expect(cartPage.checkoutButton).toHaveCount(0));
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
        'This test never clicks the CTA — see the TEST_MODE-gated test below for the click path.',
      severity: 'critical',
    });

    await searchAndAddFirstResultToCart({ page, header: homePage.header, searchPage });
    await step('Open cart', () => page.goto('/koshyk', { waitUntil: 'domcontentloaded' }));
    await step('Checkout CTA is visible', () =>
      expect(cartPage.checkoutButton).toBeVisible({ timeout: 10_000 }),
    );
  });

  test('Click "Оформити замовлення" (TEST_MODE only)', async ({
    page,
    homePage,
    searchPage,
    cartPage,
  }) => {
    // Production-safety gate: this is the ONLY test that actually clicks the
    // checkout CTA, and it only runs when explicitly opted in via TEST_MODE=true.
    // The plugin warns on every .skip() call by default — this one is load-bearing,
    // so silence the rule with a targeted disable instead of a global allow.
    // eslint-disable-next-line playwright/no-skipped-test
    test.skip(
      !env.testMode,
      'TEST_MODE=false — skipping the only test that clicks checkout. Set TEST_MODE=true to enable.',
    );

    await allureMeta({
      epic: EPIC,
      feature: FEATURE,
      story: 'TEST_MODE=true: actually proceed to checkout',
      description:
        'Adds a product, opens /koshyk and clicks the "Оформити замовлення" CTA. ' +
        'Production safety: this test is skipped unless TEST_MODE=true, so the suite never ' +
        'navigates past the cart on the live storefront.',
      severity: 'critical',
      tags: ['safety', 'test-mode'],
    });

    await searchAndAddFirstResultToCart({ page, header: homePage.header, searchPage });
    await step('Open cart', () => page.goto('/koshyk', { waitUntil: 'domcontentloaded' }));
    await step('Checkout CTA is visible', () => expect(cartPage.checkoutButton).toBeVisible());
    await step('Click checkout', () => cartPage.goToCheckout());
  });
});
