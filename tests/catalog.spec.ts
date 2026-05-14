import { test, expect } from '../fixtures/pages-fixture';
import { allureMeta, step } from '../utils/allure';

const EPIC = 'Catalog';
const FEATURE = 'Category listing';

test.describe('@regression @catalog Category listing', () => {
  test('Category page opens without 4xx/5xx', async ({ page, catalogPage }) => {
    await allureMeta({
      epic: EPIC,
      feature: FEATURE,
      story: 'Direct navigation to a category URL succeeds',
      description:
        'GET /kategoriya/pobutova-tehnika must return HTTP <400, render the category H1 ' +
        'and keep the URL on /kategoriya/...',
      severity: 'critical',
    });

    const response = await step('Navigate to category', () => catalogPage.goto());
    await step('HTTP status is < 400', () => expect(response?.status() ?? 200).toBeLessThan(400));
    await step('Category heading is visible', () => expect(catalogPage.heading).toBeVisible());
    await step('URL is /kategoriya/...', () => expect(page).toHaveURL(/\/kategoriya\//));
  });

  test('Category page displays product cards', async ({ catalogPage }) => {
    await allureMeta({
      epic: EPIC,
      feature: FEATURE,
      story: 'Category renders at least one product card',
      description:
        'After hydration, the page must show at least one product card. ' +
        'A category with zero cards points either to broken merchandising or to a routing regression.',
      severity: 'critical',
    });

    await step('Open category', () => catalogPage.goto());
    await step('At least one product card is rendered', () =>
      expect(catalogPage.productCards.first()).toBeVisible({ timeout: 15_000 }),
    );
  });

  test('Product cards contain image, title, price and add-to-cart action', async ({
    page,
    catalogPage,
  }) => {
    await allureMeta({
      epic: EPIC,
      feature: FEATURE,
      story: 'Each card exposes image, title, price and add-to-cart',
      description:
        'Asserts the listing page contains at least one product link, image, H2 title, price in ₴ ' +
        'and an "Додати в кошик" button — the four signals every shopper needs on a category page.',
      severity: 'normal',
    });

    const main = page.locator('main');
    await step('Open category', () => catalogPage.goto());
    await step('Product links are present', () =>
      expect(catalogPage.productLinks.first()).toBeVisible({ timeout: 15_000 }),
    );
    await step('Product images are present', () =>
      expect(main.locator('img').first()).toBeVisible(),
    );
    await step('Product titles (H2) are present', () =>
      expect(main.getByRole('heading', { level: 2 }).first()).toBeVisible(),
    );
    await step('Prices in ₴ are present', () =>
      expect(main.locator('span').filter({ hasText: /₴/ }).first()).toBeVisible(),
    );
    await step('Add-to-cart buttons are present', () =>
      expect(catalogPage.addToCartButtons.first()).toBeVisible(),
    );
  });

  test('Breadcrumbs are visible on category page', async ({ catalogPage }) => {
    await allureMeta({
      epic: EPIC,
      feature: FEATURE,
      story: 'Breadcrumb trail starts from "Головна"',
      description:
        'The breadcrumb navigation must be visible and contain a "Головна" link — the standard ' +
        'wayfinding affordance that lets users escape back to the homepage.',
      severity: 'minor',
    });

    await step('Open category', () => catalogPage.goto());
    await step('Breadcrumb nav is visible', () => expect(catalogPage.breadcrumbs).toBeVisible());
    await step('Breadcrumb contains "Головна" link', () =>
      expect(catalogPage.breadcrumbs.getByRole('link', { name: /головна/i })).toBeVisible(),
    );
  });
});
