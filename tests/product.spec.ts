import { test, expect } from '../fixtures/pages-fixture';
import { searchTerms } from '../test-data/search-terms';

test.describe('@regression @product Product page', () => {
  test.beforeEach(async ({ homePage, searchPage }) => {
    await homePage.header.search(searchTerms.valid[0]);
    await expect.poll(() => searchPage.resultsCount(), { timeout: 15_000 }).toBeGreaterThan(0);
  });

  test('Product page opens from search listing', async ({ page, searchPage, productPage }) => {
    await searchPage.resultLinks.first().scrollIntoViewIfNeeded();
    await searchPage.resultLinks.first().click();
    await expect(page).toHaveURL(/\/produkt\//);
    await expect(productPage.title).toBeVisible({ timeout: 15_000 });
  });

  test('Title, image and price are visible', async ({ searchPage, productPage }) => {
    await searchPage.resultLinks.first().scrollIntoViewIfNeeded();
    await searchPage.resultLinks.first().click();
    await expect(productPage.title).toBeVisible({ timeout: 15_000 });
    await expect(productPage.image).toBeVisible();
    await expect(productPage.price).toBeVisible();
    expect(await productPage.getPriceText()).toMatch(/₴/);
  });

  test('Add-to-cart button is visible', async ({ searchPage, productPage }) => {
    await searchPage.resultLinks.first().scrollIntoViewIfNeeded();
    await searchPage.resultLinks.first().click();
    await expect(productPage.addToCartButton).toBeVisible({ timeout: 15_000 });
    await expect(productPage.addToCartButton).toBeEnabled();
  });

  test('SKU and availability are displayed', async ({ searchPage, productPage }) => {
    await searchPage.resultLinks.first().scrollIntoViewIfNeeded();
    await searchPage.resultLinks.first().click();
    await expect(productPage.title).toBeVisible({ timeout: 15_000 });
    await expect(productPage.sku).toBeVisible();
    await expect(productPage.availability).toBeVisible();
  });

  test('Breadcrumbs navigate back to home', async ({ page, searchPage, productPage }) => {
    await searchPage.resultLinks.first().scrollIntoViewIfNeeded();
    await searchPage.resultLinks.first().click();
    await expect(productPage.title).toBeVisible({ timeout: 15_000 });
    await expect(productPage.breadcrumbs).toBeVisible();
    const home = productPage.breadcrumbs.getByRole('link', { name: /головна/i });
    await expect(home).toBeVisible();
    await home.scrollIntoViewIfNeeded();
    await Promise.all([
      page.waitForURL(/bestprice\.com\.ua\/?$|\/$/, { timeout: 15_000 }),
      home.click(),
    ]);
  });
});
