import { test as base } from '@playwright/test';
import {
  HomePage,
  HeaderComponent,
  FooterComponent,
  CatalogPage,
  SearchPage,
  ProductPage,
  CartPage,
  LoginPage,
  RegisterPage,
  CheckoutPage,
} from '../pages';
import { ConsoleLogger } from '../utils/console-logger';
import { dismissOverlays } from '../utils/cookie-helper';

interface PageFixtures {
  homePage: HomePage;
  header: HeaderComponent;
  footer: FooterComponent;
  catalogPage: CatalogPage;
  searchPage: SearchPage;
  productPage: ProductPage;
  cartPage: CartPage;
  loginPage: LoginPage;
  registerPage: RegisterPage;
  checkoutPage: CheckoutPage;
  consoleLogger: ConsoleLogger;
}

export const test = base.extend<PageFixtures>({
  consoleLogger: async ({ page }, use) => {
    const logger = new ConsoleLogger();
    logger.attach(page);
    await use(logger);
  },
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  homePage: async ({ page, consoleLogger }, use) => {
    const home = new HomePage(page);
    await home.goto();
    await dismissOverlays(page);
    await use(home);
  },
  header: async ({ page }, use) => use(new HeaderComponent(page)),
  footer: async ({ page }, use) => use(new FooterComponent(page)),
  catalogPage: async ({ page }, use) => use(new CatalogPage(page)),
  searchPage: async ({ page }, use) => use(new SearchPage(page)),
  productPage: async ({ page }, use) => use(new ProductPage(page)),
  cartPage: async ({ page }, use) => use(new CartPage(page)),
  loginPage: async ({ page }, use) => use(new LoginPage(page)),
  registerPage: async ({ page }, use) => use(new RegisterPage(page)),
  checkoutPage: async ({ page }, use) => use(new CheckoutPage(page)),
});

export { expect } from '@playwright/test';
