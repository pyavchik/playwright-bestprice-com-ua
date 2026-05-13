import { test, expect } from '../fixtures/pages-fixture';
import { searchTerms } from '../test-data/search-terms';

/**
 * Cart state is stored client-side and persists between pages within a session.
 * Each test clears the cart at start by clearing localStorage on the home page.
 */
test.describe('@regression @cart Cart', () => {
  test.beforeEach(async ({ page }) => {
    // Visit home so localStorage is on the right origin, then clear it.
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
    await cartPage.goto();
    await expect(cartPage.heading).toBeVisible();
    await expect(cartPage.emptyState).toBeVisible();
    expect(await cartPage.itemCount()).toBe(0);
    await expect(cartPage.continueShoppingLink).toBeVisible();
    await expect(page).toHaveURL(/\/koshyk/);
  });

  test('Add product to cart, counter updates and item appears in cart', async ({
    page,
    homePage,
    searchPage,
    cartPage,
  }) => {
    await homePage.header.search(searchTerms.valid[0]);
    await expect.poll(() => searchPage.resultsCount(), { timeout: 15_000 }).toBeGreaterThan(0);

    // Click the first product card's add-to-cart icon button directly (faster than navigating).
    const firstAddBtn = searchPage.results.first().locator('button[aria-label="Додати в кошик"]');
    await firstAddBtn.click();

    // After click, the card button switches to "Додано в кошик" — wait on header counter instead.
    await expect.poll(() => homePage.header.getCartCount(), { timeout: 10_000 }).toBe(1);

    await page.goto('/koshyk', { waitUntil: 'domcontentloaded' });
    await expect(cartPage.heading).toBeVisible();
    await expect.poll(() => cartPage.itemCount(), { timeout: 10_000 }).toBe(1);
    await expect(cartPage.quantityInputs.first()).toHaveValue('1');
  });

  test('Increase and decrease item quantity', async ({ page, homePage, searchPage, cartPage }) => {
    await homePage.header.search(searchTerms.valid[0]);
    await expect.poll(() => searchPage.resultsCount(), { timeout: 15_000 }).toBeGreaterThan(0);
    await searchPage.results.first().locator('button[aria-label="Додати в кошик"]').click();
    await expect.poll(() => homePage.header.getCartCount(), { timeout: 10_000 }).toBe(1);

    await page.goto('/koshyk', { waitUntil: 'domcontentloaded' });
    await expect(cartPage.quantityInputs.first()).toHaveValue('1');

    await cartPage.increaseQuantity(0);
    await expect(cartPage.quantityInputs.first()).toHaveValue('2');

    await cartPage.decreaseQuantity(0);
    await expect(cartPage.quantityInputs.first()).toHaveValue('1');
  });

  test('Remove item from cart', async ({ page, homePage, searchPage, cartPage }) => {
    await homePage.header.search(searchTerms.valid[0]);
    await expect.poll(() => searchPage.resultsCount(), { timeout: 15_000 }).toBeGreaterThan(0);
    await searchPage.results.first().locator('button[aria-label="Додати в кошик"]').click();
    await expect.poll(() => homePage.header.getCartCount(), { timeout: 10_000 }).toBe(1);

    await page.goto('/koshyk', { waitUntil: 'domcontentloaded' });
    await expect.poll(() => cartPage.itemCount(), { timeout: 10_000 }).toBe(1);
    await cartPage.removeItem(0);
    await expect(cartPage.emptyState).toBeVisible({ timeout: 10_000 });
    expect(await cartPage.itemCount()).toBe(0);
  });

  test('Cart persists after page reload', async ({ page, homePage, searchPage, cartPage }) => {
    await homePage.header.search(searchTerms.valid[0]);
    await expect.poll(() => searchPage.resultsCount(), { timeout: 15_000 }).toBeGreaterThan(0);
    await searchPage.results.first().locator('button[aria-label="Додати в кошик"]').click();
    await expect.poll(() => homePage.header.getCartCount(), { timeout: 10_000 }).toBe(1);

    await page.goto('/koshyk', { waitUntil: 'domcontentloaded' });
    await expect.poll(() => cartPage.itemCount(), { timeout: 10_000 }).toBe(1);
    await cartPage.reload();
    await expect.poll(() => cartPage.itemCount(), { timeout: 10_000 }).toBe(1);
  });
});
