import { test, expect } from '../fixtures/pages-fixture';
import { searchTerms } from '../test-data/search-terms';

test.describe('@regression @search Search', () => {
  test('Search by valid keyword returns results', async ({ homePage, searchPage }) => {
    await homePage.header.search(searchTerms.valid[0]);
    await expect(searchPage.heading).toContainText(searchTerms.valid[0], { timeout: 15_000 });
    await expect.poll(() => searchPage.resultsCount(), { timeout: 15_000 }).toBeGreaterThan(0);
  });

  test('Result cards contain title, price and product link', async ({ homePage, searchPage }) => {
    await homePage.header.search(searchTerms.valid[0]);
    await expect.poll(() => searchPage.resultsCount(), { timeout: 15_000 }).toBeGreaterThan(0);
    const firstCard = searchPage.results.first();
    await expect(firstCard).toBeVisible();
    await expect(firstCard.locator('a[href^="/produkt/"]').first()).toBeVisible();
    await expect(firstCard.getByRole('heading', { level: 2 }).first()).toBeVisible();
    await expect(firstCard.locator('span').filter({ hasText: /₴/ }).first()).toBeVisible();
  });

  test('Search by invalid keyword shows empty state', async ({ homePage, searchPage }) => {
    await homePage.header.search(searchTerms.invalid[0]);
    // After empty results, the page additionally shows recommendation cards;
    // assert on the empty-state message rather than result count.
    await expect(searchPage.emptyState).toBeVisible({ timeout: 15_000 });
  });

  test('Search is case-insensitive', async ({ page, homePage, searchPage }) => {
    const readResultCount = async (): Promise<number> => {
      const heading = (await searchPage.heading.textContent()) ?? '';
      const match = heading.match(/(\d+)\s*товар/i);
      return match ? Number(match[1]) : 0;
    };

    await homePage.header.search(searchTerms.caseVariants[0]);
    await expect.poll(readResultCount, { timeout: 15_000 }).toBeGreaterThan(0);
    const lowerCount = await readResultCount();

    await page.goto('/');
    await homePage.header.search(searchTerms.caseVariants[1]);
    await expect.poll(readResultCount, { timeout: 15_000 }).toBeGreaterThan(0);
    const upperCount = await readResultCount();

    expect(upperCount).toBe(lowerCount);
  });

  test('Search trims leading/trailing spaces', async ({ homePage, searchPage }) => {
    await homePage.header.search(searchTerms.withSpaces[0]);
    await expect.poll(() => searchPage.resultsCount(), { timeout: 15_000 }).toBeGreaterThan(0);
    await expect(searchPage.heading).toContainText('дриль');
  });

  test('Empty search does not crash the page', async ({ page, homePage }) => {
    await homePage.header.searchInput.click();
    await homePage.header.searchInput.fill('');
    await homePage.header.searchInput.press('Enter');
    await expect(page.locator('body')).toBeVisible();
    await expect(homePage.header.root).toBeVisible();
  });

  test('Search results page accessible via direct URL', async ({ page, searchPage }) => {
    await searchPage.gotoQuery(searchTerms.valid[1]);
    await expect(page).toHaveURL(/\/poshuk\?q=/);
    await expect.poll(() => searchPage.resultsCount(), { timeout: 15_000 }).toBeGreaterThan(0);
  });
});
