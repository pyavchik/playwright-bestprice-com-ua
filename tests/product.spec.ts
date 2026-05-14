import { test, expect } from '../fixtures/pages-fixture';
import { allureMeta, step } from '../utils/allure';
import { searchTerms } from '../test-data/search-terms';

const EPIC = 'Product';
const FEATURE = 'Product detail page';

test.describe('@regression @product Product page', () => {
  /**
   * Every test in this describe block starts already on a product detail page.
   * Centralizing the search + click here removes the repeated step in every
   * test body and keeps the assertions focused on the product page itself.
   */
  test.beforeEach(async ({ homePage, searchPage }) => {
    await homePage.header.search(searchTerms.valid[0]);
    await expect(searchPage.resultLinks.first()).toBeVisible({ timeout: 15_000 });
    await searchPage.resultLinks.first().scrollIntoViewIfNeeded();
    await searchPage.resultLinks.first().click();
  });

  test('Product page opens from search listing', async ({ page, productPage }) => {
    await allureMeta({
      epic: EPIC,
      feature: FEATURE,
      story: 'Clicking a result card opens the product page',
      description:
        'Clicks the first product link on the search-results page and asserts the URL transitions to ' +
        '/produkt/<slug> and the H1 title is visible.',
      severity: 'critical',
    });

    await step('URL is /produkt/...', () => expect(page).toHaveURL(/\/produkt\//));
    await step('Product title is visible', () =>
      expect(productPage.title).toBeVisible({ timeout: 15_000 }),
    );
  });

  test('Title, image and price are visible', async ({ productPage }) => {
    await allureMeta({
      epic: EPIC,
      feature: FEATURE,
      story: 'Product page renders title, image and price',
      description:
        'The three core decision-making signals — title (H1), image and price — must all be visible ' +
        'on the product page.',
      severity: 'critical',
    });

    await step('Title is visible', () =>
      expect(productPage.title).toBeVisible({ timeout: 15_000 }),
    );
    await step('Image is visible', () => expect(productPage.image).toBeVisible());
    await step('Price is visible and contains ₴', async () => {
      await expect(productPage.price).toBeVisible();
      await expect(productPage.price).toContainText('₴');
    });
  });

  test('Add-to-cart button is visible', async ({ productPage }) => {
    await allureMeta({
      epic: EPIC,
      feature: FEATURE,
      story: 'Add-to-cart CTA is exposed',
      description:
        'The primary "Додати в кошик" action must be visible and enabled on the product page — ' +
        'this is the conversion entry point.',
      severity: 'critical',
    });

    await step('Add-to-cart button is visible', () =>
      expect(productPage.addToCartButton).toBeVisible({ timeout: 15_000 }),
    );
    await step('Add-to-cart button is enabled', () =>
      expect(productPage.addToCartButton).toBeEnabled(),
    );
  });

  test('SKU and availability are displayed', async ({ productPage }) => {
    await allureMeta({
      epic: EPIC,
      feature: FEATURE,
      story: 'SKU and stock status are visible',
      description:
        'Verifies that the SKU ("Арт: ...") and stock badge ("В наявності" / "Залишилось...") ' +
        'are both shown on the product page. These are required for customer support and warranty flows.',
      severity: 'normal',
    });

    await step('Product title is visible', () =>
      expect(productPage.title).toBeVisible({ timeout: 15_000 }),
    );
    await step('SKU is visible', () => expect(productPage.sku).toBeVisible());
    await step('Availability badge is visible', () =>
      expect(productPage.availability).toBeVisible(),
    );
  });

  test('Breadcrumbs navigate back to home', async ({ page, productPage }) => {
    await allureMeta({
      epic: EPIC,
      feature: FEATURE,
      story: 'Clicking "Головна" in breadcrumbs returns to homepage',
      description:
        'Verifies the breadcrumb home link actually navigates: the URL must return to / after click. ' +
        'A broken breadcrumb home link is a navigation dead-end for users.',
      severity: 'minor',
    });

    await expect(productPage.title).toBeVisible({ timeout: 15_000 });
    await expect(productPage.breadcrumbs).toBeVisible();
    const home = productPage.breadcrumbs.getByRole('link', { name: /головна/i });
    await expect(home).toBeVisible();
    await step('Click "Головна" breadcrumb', async () => {
      await home.scrollIntoViewIfNeeded();
      await Promise.all([
        page.waitForURL(/bestprice\.com\.ua\/?$|\/$/, { timeout: 15_000 }),
        home.click(),
      ]);
    });
  });
});
