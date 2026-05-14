import { test, expect } from '../fixtures/pages-fixture';
import { allureMeta, step } from '../utils/allure';
import { searchTerms } from '../test-data/search-terms';

const EPIC = 'Responsive';
const FEATURE = 'Mobile viewport';

test.describe('@mobile Mobile responsive', () => {
  test('Home page renders on mobile viewport', async ({ homePage }) => {
    await allureMeta({
      epic: EPIC,
      feature: FEATURE,
      story: 'Homepage layout works on a phone-sized viewport',
      description:
        'Loads the homepage under a Pixel 7 / iPhone 14 emulation. Body and header must render without errors.',
      severity: 'critical',
    });

    await step('Body is visible', () => expect(homePage.body()).toBeVisible());
    await step('Header is visible', () => expect(homePage.header.root).toBeVisible());
  });

  test('Mobile navigation bar is visible at the bottom', async ({ homePage }) => {
    await allureMeta({
      epic: EPIC,
      feature: FEATURE,
      story: 'Bottom tab bar is present',
      description:
        'On mobile, navigation lives in a fixed bottom tab bar ("Мобільна навігація") with at least ' +
        'a cart link. The test asserts both are visible.',
      severity: 'normal',
    });

    await step('Mobile nav is visible', () => expect(homePage.header.mobileNav).toBeVisible());
    await step('Cart link in mobile nav is visible', () =>
      expect(homePage.header.mobileCartLink).toBeVisible(),
    );
  });

  test('Cart link in mobile nav navigates to /koshyk', async ({ page, homePage }) => {
    await allureMeta({
      epic: EPIC,
      feature: FEATURE,
      story: 'Mobile cart tab lands on /koshyk',
      description: 'Clicking the mobile bottom-bar cart link must navigate to /koshyk.',
      severity: 'critical',
    });

    await step('Tap mobile cart link', () => homePage.header.mobileCartLink.click());
    await step('URL is /koshyk', () => expect(page).toHaveURL(/\/koshyk/));
  });

  test('Search works on mobile', async ({ homePage, searchPage }) => {
    await allureMeta({
      epic: EPIC,
      feature: FEATURE,
      story: 'Header search is functional on mobile',
      description:
        'The header search input must work the same on a mobile viewport: typing a keyword and ' +
        'submitting must land on /poshuk with results.',
      severity: 'critical',
    });

    await step(`Search for "${searchTerms.valid[0]}"`, () =>
      homePage.header.search(searchTerms.valid[0]),
    );
    await step('Results render', () =>
      expect(searchPage.resultLinks.first()).toBeVisible({ timeout: 15_000 }),
    );
  });
});
