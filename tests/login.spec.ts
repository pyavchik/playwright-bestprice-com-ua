import { test, expect } from '../fixtures/pages-fixture';

test.describe('@regression @login Login & register', () => {
  test('Login page opens with identifier and password fields', async ({ page, loginPage }) => {
    await loginPage.goto();
    await expect(page).toHaveURL(/\/vkhid/);
    await expect(loginPage.identifierInput).toBeVisible();
    await expect(loginPage.passwordInput).toBeVisible();
    await expect(loginPage.submitButton).toBeVisible();
  });

  test('Empty login form does not authenticate (stays on /vkhid)', async ({ page, loginPage }) => {
    await loginPage.goto();
    await loginPage.submitEmpty();
    // Form is enforced by HTML5 required/validation OR server response keeps us on the same page.
    await expect(page).toHaveURL(/\/vkhid/);
  });

  test('Invalid credentials are rejected', async ({ page, loginPage }) => {
    await loginPage.goto();
    await loginPage.login('nosuch.user@example.test', 'wrong-password-1234');
    // Either a server-side error is shown, or we remain on /vkhid.
    await expect(page).toHaveURL(/\/vkhid/, { timeout: 15_000 });
  });

  test('Register page opens via login page link', async ({ page, loginPage, registerPage }) => {
    await loginPage.goto();
    await expect(loginPage.registerLink).toBeVisible();
    await loginPage.registerLink.click();
    await expect(page).toHaveURL(/\/reyestratsiya/);
    await expect(registerPage.heading).toBeVisible();
    await expect(registerPage.emailInput).toBeVisible();
    await expect(registerPage.phoneInput).toBeVisible();
    await expect(registerPage.passwordInput).toBeVisible();
  });
});
