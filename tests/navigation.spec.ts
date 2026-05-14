import { test, expect } from '../fixtures/pages-fixture';
import { allureMeta, step } from '../utils/allure';

const EPIC = 'Navigation';
const FEATURE = 'Header navigation';

test.describe('@regression Header navigation', () => {
  test('Navigate to cart from header', async ({ page, homePage }) => {
    await allureMeta({
      epic: EPIC,
      feature: FEATURE,
      story: 'Header cart control routes to /koshyk',
      description:
        'Clicking the cart control in the header (button on desktop, link on mobile) must land on /koshyk.',
      severity: 'critical',
    });

    await step('Open cart from header', () => homePage.header.openCart());
    await step('URL is /koshyk', () => expect(page).toHaveURL(/\/koshyk/));
  });

  test('Navigate to login from header', async ({ page, homePage }) => {
    await allureMeta({
      epic: EPIC,
      feature: FEATURE,
      story: 'Header "Увійти" link routes to /vkhid',
      description: 'Clicking the "Увійти" link in the header must land on /vkhid.',
      severity: 'critical',
    });

    await step('Click "Увійти"', () => homePage.header.openLogin());
    await step('URL is /vkhid', () => expect(page).toHaveURL(/\/vkhid/));
  });

  test('Catalog button opens the category menu', async ({ homePage }) => {
    await allureMeta({
      epic: EPIC,
      feature: FEATURE,
      story: 'Catalog button reveals the category menu',
      description:
        'Clicking the "Каталог" button must surface a category menu — either a side panel ' +
        '(complementary) or a dialog (mobile) — that contains the category links.',
      severity: 'normal',
    });

    await step('Catalog button is enabled', () =>
      expect(homePage.header.catalogButton).toBeEnabled(),
    );
    await step('Open catalog menu', () => homePage.header.openCatalog());
    const menu = homePage.page
      .getByRole('navigation', { name: /каталог категорій/i })
      .or(homePage.page.getByRole('dialog', { name: /навігаційне меню|каталог/i }));
    await step('Catalog menu is visible', () =>
      expect(menu.first()).toBeVisible({ timeout: 5_000 }),
    );
    await step('At least one category link is visible', () =>
      expect(menu.first().getByRole('link').first()).toBeVisible(),
    );
  });

  test('Navigation works after page reload', async ({ page, homePage }) => {
    await allureMeta({
      epic: EPIC,
      feature: FEATURE,
      story: 'Header is fully functional after a hard reload',
      description:
        'Reloads the homepage and immediately tries to navigate to /koshyk via the cart control. ' +
        'This catches regressions where header hydration breaks after a reload.',
      severity: 'normal',
    });

    await step('Reload homepage', () => homePage.reload());
    await step('Header is visible', () => expect(homePage.header.root).toBeVisible());
    await step('Open cart from header', () => homePage.header.openCart());
    await step('URL is /koshyk', () => expect(page).toHaveURL(/\/koshyk/));
  });
});
