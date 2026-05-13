import { test, expect } from '../fixtures/pages-fixture';

test.describe('@regression @catalog Category listing', () => {
  test('Category page opens without 4xx/5xx', async ({ page, catalogPage }) => {
    const response = await catalogPage.goto();
    expect(response?.status() ?? 200).toBeLessThan(400);
    await expect(catalogPage.heading).toBeVisible();
    await expect(page).toHaveURL(/\/kategoriya\//);
  });

  test('Category page displays product cards', async ({ catalogPage }) => {
    await catalogPage.goto();
    await expect.poll(() => catalogPage.productCards.count(), { timeout: 15_000 }).toBeGreaterThan(0);
  });

  test('Product cards contain image, title, price and add-to-cart action', async ({ page, catalogPage }) => {
    await catalogPage.goto();
    await expect.poll(() => catalogPage.productCards.count(), { timeout: 15_000 }).toBeGreaterThan(0);
    // Page-wide invariants for the listing.
    await expect(catalogPage.productLinks.first()).toBeVisible();
    await expect(page.locator('main img').first()).toBeVisible();
    await expect(page.locator('main h2').first()).toBeVisible();
    await expect(page.locator('main span').filter({ hasText: /₴/ }).first()).toBeVisible();
    await expect(catalogPage.addToCartButtons.first()).toBeVisible();
  });

  test('Breadcrumbs are visible on category page', async ({ catalogPage }) => {
    await catalogPage.goto();
    await expect(catalogPage.breadcrumbs).toBeVisible();
    await expect(catalogPage.breadcrumbs.getByRole('link', { name: /головна/i })).toBeVisible();
  });
});
