import { test, expect } from '../fixtures/pages-fixture';
import { searchTerms } from '../test-data/search-terms';

test.describe('@mobile Mobile responsive', () => {
  test('Home page renders on mobile viewport', async ({ homePage }) => {
    await expect(homePage.body()).toBeVisible();
    await expect(homePage.header.root).toBeVisible();
  });

  test('Mobile navigation bar is visible at the bottom', async ({ homePage }) => {
    await expect(homePage.header.mobileNav).toBeVisible();
    await expect(homePage.header.mobileCartLink).toBeVisible();
  });

  test('Cart link in mobile nav navigates to /koshyk', async ({ page, homePage }) => {
    await homePage.header.mobileCartLink.click();
    await expect(page).toHaveURL(/\/koshyk/);
  });

  test('Search works on mobile', async ({ homePage, searchPage }) => {
    await homePage.header.search(searchTerms.valid[0]);
    await expect.poll(() => searchPage.resultsCount(), { timeout: 15_000 }).toBeGreaterThan(0);
  });
});
