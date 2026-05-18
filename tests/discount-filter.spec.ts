import { test, expect } from '../fixtures/pages-fixture';
import { allureMeta, step } from '../utils/allure';

const EPIC = 'Catalog';
const FEATURE = 'Filters';
const CATEGORY_SLUG = 'kutovi-shlifuvaljni-mashini-bolgarki';

test.describe('@regression @catalog "With discount" filter', () => {
  // Will fail red until SCRUM-33 ships — that's intentional. allure-playwright
  // doesn't emit results for fixme'd tests and test.fail() shows a green pass,
  // both of which hide the bug. A real failing test is the only way to keep
  // SCRUM-33 visible in the Allure report (categorised as "Product defects").
  test('Activating "Зі знижкою" filter restricts the grid to discounted products only [SCRUM-33]', async ({
    page,
    catalogPage,
  }) => {
    await allureMeta({
      epic: EPIC,
      feature: FEATURE,
      story: 'Sidebar "Зі знижкою" checkbox filters the category grid',
      description:
        'Regression test for SCRUM-33. On a category page, ticking the "Зі знижкою" filter ' +
        '(URL param ?filter=salePrice) must (a) add the param to the URL, (b) decrease the total ' +
        'product counter, and (c) leave only products with a meaningful discount in the grid — ' +
        'every visible card should expose a sale-price block (data-testid="product-card-price-sale"). ' +
        'Currently the server query ignores the param, so non-discounted products leak into the grid.',
      severity: 'normal',
      links: [
        {
          url: 'https://bestrpricecomua.atlassian.net/browse/SCRUM-33',
          name: 'SCRUM-33',
          type: 'issue',
        },
        {
          url: 'https://bestrpricecomua.atlassian.net/browse/SCRUM-T197',
          name: 'SCRUM-T197',
          type: 'test_case',
        },
      ],
    });

    const baseline = await step('Open category without filter', async () => {
      await catalogPage.gotoSlug(CATEGORY_SLUG);
      await expect(catalogPage.heading).toBeVisible();
      return catalogPage.readTotalCount();
    });

    await step('Baseline category has at least 2 products', () =>
      expect(baseline).toBeGreaterThan(1),
    );

    await step('Tick "Зі знижкою" checkbox', async () => {
      // The checkbox is a Radix custom widget (role=checkbox on a <span>), so
      // `.check()` can't verify aria-checked reliably and React hydration may
      // miss the first click. Click the surrounding <label> and poll URL.
      await expect(async () => {
        await catalogPage.discountFilterLabel.click();
        await expect(page).toHaveURL(/[?&]filter=salePrice\b/, { timeout: 1500 });
      }).toPass({ timeout: 10_000 });
    });

    await step('Active-filter chip "Зі знижкою" is visible', () =>
      expect(catalogPage.discountFilterChip).toBeVisible(),
    );

    const filtered = await step('Total counter recalculates to fewer products', async () => {
      await expect(catalogPage.totalCounter).toBeVisible();
      const count = await catalogPage.readTotalCount();
      expect(count).toBeGreaterThan(0);
      expect(count).toBeLessThan(baseline);
      return count;
    });

    await step('Every visible card has a sale-price block', async () => {
      await expect(catalogPage.productCardEls.first()).toBeVisible();
      const cards = await catalogPage.productCardEls.count();
      // Cards on screen ≤ filtered total; every one of them must be a discounted SKU.
      await expect(catalogPage.discountedPriceBlocks).toHaveCount(cards);
    });

    await step('Filter survives a deep-link entry (fresh navigation)', async () => {
      await catalogPage.gotoSlug(CATEGORY_SLUG, '?filter=salePrice');
      await expect(catalogPage.discountFilterCheckbox).toBeChecked();
      const deepLinkCount = await catalogPage.readTotalCount();
      expect(deepLinkCount).toBe(filtered);
    });
  });
});
