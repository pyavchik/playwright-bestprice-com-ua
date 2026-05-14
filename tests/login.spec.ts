import { test, expect } from '../fixtures/pages-fixture';
import { allureMeta, step } from '../utils/allure';

const EPIC = 'Authentication';
const FEATURE = 'Login & register';

test.describe('@regression @login Login & register', () => {
  test('Login page opens with identifier and password fields', async ({ page, loginPage }) => {
    await allureMeta({
      epic: EPIC,
      feature: FEATURE,
      story: 'Login form renders required fields',
      description:
        'Navigates to /vkhid and asserts the identifier input (email/phone), password input and ' +
        'submit button are all visible.',
      severity: 'critical',
    });

    await step('Open /vkhid', () => loginPage.goto());
    await step('URL is /vkhid', () => expect(page).toHaveURL(/\/vkhid/));
    await step('Identifier input is visible', () =>
      expect(loginPage.identifierInput).toBeVisible(),
    );
    await step('Password input is visible', () => expect(loginPage.passwordInput).toBeVisible());
    await step('Submit button is visible', () => expect(loginPage.submitButton).toBeVisible());
  });

  test('Empty login form does not authenticate (stays on /vkhid)', async ({ page, loginPage }) => {
    await allureMeta({
      epic: EPIC,
      feature: FEATURE,
      story: 'Empty submit is rejected client-side',
      description:
        'Clicks submit without filling either field. The page must remain on /vkhid (HTML5 required ' +
        'attributes or server-side validation prevent authentication).',
      severity: 'normal',
    });

    await step('Open /vkhid', () => loginPage.goto());
    await step('Submit empty form', () => loginPage.submitEmpty());
    await step('Still on /vkhid', () => expect(page).toHaveURL(/\/vkhid/));
  });

  test('Invalid credentials are rejected', async ({ page, loginPage }) => {
    await allureMeta({
      epic: EPIC,
      feature: FEATURE,
      story: 'Wrong credentials do not authenticate',
      description:
        'Submits a clearly-invalid email/password pair. Must remain on /vkhid — either through an ' +
        'inline error or by ignoring the submission. This is the canary that login is actually wired ' +
        'to an auth backend.',
      severity: 'critical',
    });

    await step('Open /vkhid', () => loginPage.goto());
    await step('Submit invalid credentials', () =>
      loginPage.login('nosuch.user@example.test', 'wrong-password-1234'),
    );
    await step('Still on /vkhid', () => expect(page).toHaveURL(/\/vkhid/, { timeout: 15_000 }));
  });

  test('Register page opens via login page link', async ({ page, loginPage, registerPage }) => {
    await allureMeta({
      epic: EPIC,
      feature: FEATURE,
      story: 'Register flow is reachable from the login page',
      description:
        'Clicks the "Зареєструватися" link on /vkhid and asserts the registration page renders the ' +
        'required email, phone and password inputs.',
      severity: 'normal',
    });

    await step('Open /vkhid', () => loginPage.goto());
    await step('Click "Зареєструватися"', async () => {
      await expect(loginPage.registerLink).toBeVisible();
      await loginPage.registerLink.click();
    });
    await step('URL is /reyestratsiya', () => expect(page).toHaveURL(/\/reyestratsiya/));
    await step('Register card title is visible', () => expect(registerPage.heading).toBeVisible());
    await step('Email input is visible', () => expect(registerPage.emailInput).toBeVisible());
    await step('Phone input is visible', () => expect(registerPage.phoneInput).toBeVisible());
    await step('Password input is visible', () => expect(registerPage.passwordInput).toBeVisible());
  });
});
