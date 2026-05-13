import { test, expect } from '../fixtures/pages-fixture';

test.describe('@regression Header navigation', () => {
  test('Navigate to cart from header', async ({ page, homePage }) => {
    await homePage.header.openCart();
    await expect(page).toHaveURL(/\/koshyk/);
  });

  test('Navigate to login from header', async ({ page, homePage }) => {
    await homePage.header.openLogin();
    await expect(page).toHaveURL(/\/vkhid/);
  });

  test('Catalog button opens the category menu', async ({ homePage }) => {
    await expect(homePage.header.catalogButton).toBeEnabled();
    await homePage.header.openCatalog();
    // Desktop: side panel (complementary); mobile: dialog. Both wrap a navigation
    // labelled "Каталог категорій" or "Навігаційне меню".
    const menu = homePage.page
      .getByRole('navigation', { name: /каталог категорій/i })
      .or(homePage.page.getByRole('dialog', { name: /навігаційне меню|каталог/i }));
    await expect(menu.first()).toBeVisible({ timeout: 5_000 });
    await expect(menu.first().getByRole('link').first()).toBeVisible();
  });

  test('Navigation works after page reload', async ({ page, homePage }) => {
    await homePage.reload();
    await expect(homePage.header.root).toBeVisible();
    await homePage.header.openCart();
    await expect(page).toHaveURL(/\/koshyk/);
  });
});
