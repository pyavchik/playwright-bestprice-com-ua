import { test, expect } from '../fixtures/pages-fixture';
import { allureMeta, step } from '../utils/allure';

const EPIC = 'Smoke';
const FEATURE = 'Home page';

test.describe('@smoke Home page', () => {
  test('Home page opens successfully', async ({ homePage }) => {
    await allureMeta({
      epic: EPIC,
      feature: FEATURE,
      story: 'Visitor opens the storefront homepage',
      description:
        'Verifies that https://bestprice.com.ua loads and the page <title> contains the brand name. ' +
        'Acts as the canary that everything below (browser launch, network, base URL, locale) is healthy.',
      severity: 'blocker',
    });

    await step('Page body is visible', async () => {
      await expect(homePage.body()).toBeVisible();
    });
    await step('Page title contains "BestPrice"', async () => {
      expect(await homePage.getPageTitle()).toContain('BestPrice');
    });
  });

  test('Header is visible with logo, search, catalog, cart and login', async ({ homePage }) => {
    await allureMeta({
      epic: EPIC,
      feature: FEATURE,
      story: 'Header exposes every navigation control',
      description:
        'Confirms the persistent top header renders the brand logo, search combobox, catalog button, ' +
        'cart button and login link — the entry points users rely on to navigate anywhere on the site.',
      severity: 'critical',
    });

    await step('Header container is visible', () => expect(homePage.header.root).toBeVisible());
    await step('Logo is visible', () => expect(homePage.header.logo).toBeVisible());
    await step('Search input is visible', () => expect(homePage.header.searchInput).toBeVisible());
    await step('Catalog button is visible', () =>
      expect(homePage.header.catalogButton).toBeVisible(),
    );
    await step('Cart button is visible', () => expect(homePage.header.cartButton).toBeVisible());
    await step('Login link is visible', () => expect(homePage.header.loginLink).toBeVisible());
  });

  test('Footer is visible with contact info', async ({ homePage }) => {
    await allureMeta({
      epic: EPIC,
      feature: FEATURE,
      story: 'Footer exposes contact channels',
      description:
        'Scrolls to the footer and asserts that at least one phone link (tel:) and one email link (mailto:) are present. ' +
        'These are the legally required customer-service touchpoints for the storefront.',
      severity: 'normal',
    });

    await step('Scroll footer into view', () => homePage.footer.root.scrollIntoViewIfNeeded());
    await step('Footer is visible', () => expect(homePage.footer.root).toBeVisible());
    await step('At least one phone link', async () =>
      expect(await homePage.footer.phoneLinks.count()).toBeGreaterThan(0),
    );
    await step('At least one email link', async () =>
      expect(await homePage.footer.emailLinks.count()).toBeGreaterThan(0),
    );
  });

  test('Featured products section renders product cards', async ({ homePage }) => {
    await allureMeta({
      epic: EPIC,
      feature: FEATURE,
      story: 'Homepage surfaces featured products',
      description:
        'After load, the "Найкращі пропозиції" section must render at least one product card with an add-to-cart action. ' +
        'A homepage without merchandising means a broken merchandising pipeline.',
      severity: 'critical',
    });

    await step('Wait for at least one product card', () =>
      expect.poll(() => homePage.productCards.count(), { timeout: 15_000 }).toBeGreaterThan(0),
    );
  });
});
