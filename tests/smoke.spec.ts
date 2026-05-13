import { test, expect } from '../fixtures/pages-fixture';

test.describe('@smoke Home page', () => {
  test('Home page opens successfully', async ({ homePage }) => {
    await expect(homePage.body()).toBeVisible();
    expect(await homePage.getPageTitle()).toContain('BestPrice');
  });

  test('Header is visible with logo, search, catalog, cart and login', async ({ homePage }) => {
    await expect(homePage.header.root).toBeVisible();
    await expect(homePage.header.logo).toBeVisible();
    await expect(homePage.header.searchInput).toBeVisible();
    await expect(homePage.header.catalogButton).toBeVisible();
    await expect(homePage.header.cartButton).toBeVisible();
    await expect(homePage.header.loginLink).toBeVisible();
  });

  test('Footer is visible with contact info', async ({ homePage }) => {
    await homePage.footer.root.scrollIntoViewIfNeeded();
    await expect(homePage.footer.root).toBeVisible();
    expect(await homePage.footer.phoneLinks.count()).toBeGreaterThan(0);
    expect(await homePage.footer.emailLinks.count()).toBeGreaterThan(0);
  });

  test('Featured products section renders product cards', async ({ homePage }) => {
    await expect.poll(() => homePage.productCards.count(), { timeout: 15_000 }).toBeGreaterThan(0);
  });
});
