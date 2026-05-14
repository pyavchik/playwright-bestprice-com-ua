import { test, expect } from '../fixtures/pages-fixture';
import { allureMeta, step } from '../utils/allure';
import { searchAndAddFirstResultToCart } from '../utils/test-flows';

const EPIC = 'Cart';
const FEATURE = 'Cart management';

/**
 * Cart state is stored client-side and persists between pages within a session.
 * Each test clears the cart at start by clearing localStorage on the home page.
 */
test.describe('@regression @cart Cart', () => {
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

  test('Empty cart page shows empty state', async ({ page, cartPage }) => {
    await allureMeta({
      epic: EPIC,
      feature: FEATURE,
      story: 'Cart page is reachable in an empty state',
      description:
        'After clearing local storage, /koshyk must render the "Кошик" H1, the "Ваш кошик порожній" ' +
        'empty-state message, no line items and a "Продовжити покупки" CTA back to the storefront.',
      severity: 'normal',
    });

    await step('Open cart', () => cartPage.goto());
    await step('Cart heading is visible', () => expect(cartPage.heading).toBeVisible());
    await step('Empty-state message is visible', () => expect(cartPage.emptyState).toBeVisible());
    await step('No line items', () => expect(cartPage.removeButtons).toHaveCount(0));
    await step('Continue-shopping link is visible', () =>
      expect(cartPage.continueShoppingLink).toBeVisible(),
    );
    await step('URL is /koshyk', () => expect(page).toHaveURL(/\/koshyk/));
  });

  test('Add product to cart, counter updates and item appears in cart', async ({
    page,
    homePage,
    searchPage,
    cartPage,
  }) => {
    await allureMeta({
      epic: EPIC,
      feature: FEATURE,
      story: 'Add-to-cart from search results updates header and cart page',
      description:
        'Searches for a common keyword, clicks the add-to-cart icon on the first result card, and ' +
        'verifies both the header cart counter and the /koshyk page reflect the new item.',
      severity: 'blocker',
    });

    await searchAndAddFirstResultToCart({ page, header: homePage.header, searchPage });
    await step('Open cart page', () => page.goto('/koshyk', { waitUntil: 'domcontentloaded' }));
    await step('Cart heading is visible', () => expect(cartPage.heading).toBeVisible());
    await step('Exactly one line item', () =>
      expect(cartPage.removeButtons).toHaveCount(1, { timeout: 10_000 }),
    );
    await step('Default quantity is 1', () =>
      expect(cartPage.quantityInputs.first()).toHaveValue('1'),
    );
  });

  test('Increase and decrease item quantity', async ({ page, homePage, searchPage, cartPage }) => {
    await allureMeta({
      epic: EPIC,
      feature: FEATURE,
      story: 'Quantity stepper updates the line item',
      description:
        'After adding a product, clicking + and − must update the quantity input. Verifies the cart UI ' +
        'commits each change before the next assertion (no stale optimistic state).',
      severity: 'critical',
    });

    await searchAndAddFirstResultToCart({ page, header: homePage.header, searchPage });
    await step('Open cart', () => page.goto('/koshyk', { waitUntil: 'domcontentloaded' }));
    await step('Quantity starts at 1', () =>
      expect(cartPage.quantityInputs.first()).toHaveValue('1'),
    );
    await step('Click increase → quantity 2', async () => {
      await cartPage.increaseQuantity(0);
      await expect(cartPage.quantityInputs.first()).toHaveValue('2');
    });
    await step('Click decrease → quantity 1', async () => {
      await cartPage.decreaseQuantity(0);
      await expect(cartPage.quantityInputs.first()).toHaveValue('1');
    });
  });

  test('Remove item from cart', async ({ page, homePage, searchPage, cartPage }) => {
    await allureMeta({
      epic: EPIC,
      feature: FEATURE,
      story: 'Removing the only item returns the cart to empty state',
      description:
        'Clicks the "Видалити з кошика" button on the only line item. The cart must transition back ' +
        'to the empty-state message and the item count must drop to 0.',
      severity: 'critical',
    });

    await searchAndAddFirstResultToCart({ page, header: homePage.header, searchPage });
    await step('Open cart', () => page.goto('/koshyk', { waitUntil: 'domcontentloaded' }));
    await step('Wait for cart line item', () =>
      expect(cartPage.removeButtons).toHaveCount(1, { timeout: 10_000 }),
    );
    await step('Remove the item', () => cartPage.removeItem(0));
    await step('Empty state appears', () =>
      expect(cartPage.emptyState).toBeVisible({ timeout: 10_000 }),
    );
    await step('Cart is empty', () => expect(cartPage.removeButtons).toHaveCount(0));
  });

  test('Cart persists after page reload', async ({ page, homePage, searchPage, cartPage }) => {
    await allureMeta({
      epic: EPIC,
      feature: FEATURE,
      story: 'Reloading /koshyk keeps the line item',
      description:
        'Adds a product, navigates to /koshyk, reloads the page and verifies the line item is still ' +
        'present. Catches regressions where cart state lives only in memory.',
      severity: 'critical',
    });

    await searchAndAddFirstResultToCart({ page, header: homePage.header, searchPage });
    await step('Open cart', () => page.goto('/koshyk', { waitUntil: 'domcontentloaded' }));
    await step('Wait for the item', () =>
      expect(cartPage.removeButtons).toHaveCount(1, { timeout: 10_000 }),
    );
    await step('Reload page', () => cartPage.reload());
    await step('Item is still there', () =>
      expect(cartPage.removeButtons).toHaveCount(1, { timeout: 10_000 }),
    );
  });
});
