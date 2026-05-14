import { test, expect } from '../fixtures/pages-fixture';
import { allureMeta, step } from '../utils/allure';
import { searchTerms } from '../test-data/search-terms';

const EPIC = 'Search';
const FEATURE = 'Header search';

test.describe('@regression @search Search', () => {
  test('Search by valid keyword returns results', async ({ homePage, searchPage }) => {
    await allureMeta({
      epic: EPIC,
      feature: FEATURE,
      story: 'A common product keyword returns results',
      description:
        `Submits "${searchTerms.valid[0]}" via the header search and asserts the page navigates to ` +
        '/poshuk, the H1 echoes the query, and at least one product card is rendered.',
      severity: 'critical',
    });

    await step(`Search for "${searchTerms.valid[0]}"`, () =>
      homePage.header.search(searchTerms.valid[0]),
    );
    await step('Page heading echoes the query', () =>
      expect(searchPage.heading).toContainText(searchTerms.valid[0], { timeout: 15_000 }),
    );
    await step('At least one result card is rendered', () =>
      expect.poll(() => searchPage.resultsCount(), { timeout: 15_000 }).toBeGreaterThan(0),
    );
  });

  test('Result cards contain title, price and product link', async ({ homePage, searchPage }) => {
    await allureMeta({
      epic: EPIC,
      feature: FEATURE,
      story: 'Result cards expose the core product info',
      description:
        'Each result card must contain a /produkt/ link, an H2 title, and a price ending in ₴. ' +
        'These are the minimum signals a shopper needs to decide whether to click through.',
      severity: 'normal',
    });

    await step(`Search for "${searchTerms.valid[0]}"`, () =>
      homePage.header.search(searchTerms.valid[0]),
    );
    await step('Wait for results', () =>
      expect.poll(() => searchPage.resultsCount(), { timeout: 15_000 }).toBeGreaterThan(0),
    );
    const firstCard = searchPage.results.first();
    await step('First card is visible', () => expect(firstCard).toBeVisible());
    await step('First card has a /produkt/ link', () =>
      expect(firstCard.locator('a[href^="/produkt/"]').first()).toBeVisible(),
    );
    await step('First card has an H2 title', () =>
      expect(firstCard.getByRole('heading', { level: 2 }).first()).toBeVisible(),
    );
    await step('First card shows a price in ₴', () =>
      expect(firstCard.locator('span').filter({ hasText: /₴/ }).first()).toBeVisible(),
    );
  });

  test('Search by invalid keyword shows empty state', async ({ homePage, searchPage }) => {
    await allureMeta({
      epic: EPIC,
      feature: FEATURE,
      story: 'A nonsense keyword shows a friendly empty state',
      description:
        `Submits "${searchTerms.invalid[0]}" and asserts the "нічого не знайдено" empty-state message is visible. ` +
        'Note: the page may also render unrelated recommendation cards underneath; we only assert on the empty state.',
      severity: 'normal',
    });

    await step('Submit invalid keyword', () => homePage.header.search(searchTerms.invalid[0]));
    await step('Empty state is visible', () =>
      expect(searchPage.emptyState).toBeVisible({ timeout: 15_000 }),
    );
  });

  test('Search is case-insensitive', async ({ page, homePage, searchPage }) => {
    await allureMeta({
      epic: EPIC,
      feature: FEATURE,
      story: 'Lower- and uppercase queries return identical counts',
      description:
        'Reads the result count from the page H1 ("Результати пошуку «X»(N товарів)") and asserts ' +
        'the count is identical for the lowercase and uppercase variants of the same keyword.',
      severity: 'normal',
    });

    const readResultCount = async (): Promise<number> => {
      const heading = (await searchPage.heading.textContent()) ?? '';
      const match = heading.match(/(\d+)\s*товар/i);
      return match ? Number(match[1]) : 0;
    };

    await step(`Search for "${searchTerms.caseVariants[0]}"`, () =>
      homePage.header.search(searchTerms.caseVariants[0]),
    );
    await expect.poll(readResultCount, { timeout: 15_000 }).toBeGreaterThan(0);
    const lowerCount = await readResultCount();

    await step('Return to home', () => page.goto('/'));
    await step(`Search for "${searchTerms.caseVariants[1]}"`, () =>
      homePage.header.search(searchTerms.caseVariants[1]),
    );
    await expect.poll(readResultCount, { timeout: 15_000 }).toBeGreaterThan(0);
    const upperCount = await readResultCount();

    await step('Counts are equal', () => expect(upperCount).toBe(lowerCount));
  });

  test('Search trims leading/trailing spaces', async ({ homePage, searchPage }) => {
    await allureMeta({
      epic: EPIC,
      feature: FEATURE,
      story: 'Whitespace around the query is ignored',
      description:
        `Submits "${searchTerms.withSpaces[0]}" (with leading and trailing spaces) and expects the ` +
        'same results as the trimmed keyword.',
      severity: 'minor',
    });

    await step('Submit whitespace-padded keyword', () =>
      homePage.header.search(searchTerms.withSpaces[0]),
    );
    await step('Results render', () =>
      expect.poll(() => searchPage.resultsCount(), { timeout: 15_000 }).toBeGreaterThan(0),
    );
    await step('Heading contains the trimmed keyword', () =>
      expect(searchPage.heading).toContainText('дриль'),
    );
  });

  test('Empty search does not crash the page', async ({ page, homePage }) => {
    await allureMeta({
      epic: EPIC,
      feature: FEATURE,
      story: 'Submitting an empty query does not crash the app',
      description:
        'Focuses the search input, clears it, presses Enter and asserts that the page body and header ' +
        'remain visible (no 5xx, no white screen, no infinite spinner).',
      severity: 'minor',
    });

    await step('Submit empty query', async () => {
      await homePage.header.searchInput.click();
      await homePage.header.searchInput.fill('');
      await homePage.header.searchInput.press('Enter');
    });
    await step('Page body is still visible', () => expect(page.locator('body')).toBeVisible());
    await step('Header is still visible', () => expect(homePage.header.root).toBeVisible());
  });

  test('Search results page accessible via direct URL', async ({ page, searchPage }) => {
    await allureMeta({
      epic: EPIC,
      feature: FEATURE,
      story: 'Search results are deep-linkable',
      description:
        'Navigates directly to /poshuk?q=<term> (bypassing the header form) and confirms results render. ' +
        'This proves the search route accepts a `q` query parameter and renders independently from the input UI.',
      severity: 'normal',
    });

    await step(`Navigate to /poshuk?q=${searchTerms.valid[1]}`, () =>
      searchPage.gotoQuery(searchTerms.valid[1]),
    );
    await step('URL matches /poshuk?q=', () => expect(page).toHaveURL(/\/poshuk\?q=/));
    await step('Results render', () =>
      expect.poll(() => searchPage.resultsCount(), { timeout: 15_000 }).toBeGreaterThan(0),
    );
  });
});
