import { test, expect } from '../fixtures/pages-fixture';
import { allureMeta, step } from '../utils/allure';

const EPIC = 'Footer & info pages';
const FEATURE = 'Footer links';

interface FooterPage {
  name: RegExp;
  expectedPath: string;
  label: string;
}

const FOOTER_PAGES: FooterPage[] = [
  { name: /^про нас$/i, expectedPath: '/pro-nas', label: 'About' },
  { name: /^доставка та оплата$/i, expectedPath: '/dostavka-oplata', label: 'Delivery & payment' },
  { name: /^повернення та обмін$/i, expectedPath: '/povernennia', label: 'Warranty & return' },
  { name: /^публічний договір$/i, expectedPath: '/oferta', label: 'Public agreement' },
  { name: /^політика конфіденційності$/i, expectedPath: '/pryvatnist', label: 'Privacy policy' },
  { name: /^контакти$/i, expectedPath: '/kontakty', label: 'Contacts' },
];

test.describe('@regression @footer Footer & info pages', () => {
  test('Footer contact info is visible', async ({ homePage }) => {
    await allureMeta({
      epic: EPIC,
      feature: FEATURE,
      story: 'Phone and email links are exposed in the footer',
      description:
        'Scrolls to the footer and asserts at least one tel: link and one mailto: link are visible. ' +
        'These are the legally required contact channels for customer support.',
      severity: 'normal',
    });

    await step('Scroll footer into view', () => homePage.footer.root.scrollIntoViewIfNeeded());
    await step('Phone link is visible', () =>
      expect(homePage.footer.phoneLinks.first()).toBeVisible(),
    );
    await step('Email link is visible', () =>
      expect(homePage.footer.emailLinks.first()).toBeVisible(),
    );
  });

  for (const item of FOOTER_PAGES) {
    test(`Footer link opens ${item.label} page`, async ({ page, homePage }) => {
      await allureMeta({
        epic: EPIC,
        feature: FEATURE,
        story: `${item.label} page is reachable from the footer`,
        description:
          `Asserts the footer link "${item.label}" points to ${item.expectedPath} and that ` +
          'a GET on that path returns HTTP <400, with a heading on the resulting page.',
        severity: 'minor',
      });

      await step('Scroll footer into view', () => homePage.footer.root.scrollIntoViewIfNeeded());
      const link = homePage.footer.link(item.name).first();
      await step(`Link "${item.label}" is visible`, () => expect(link).toBeVisible());
      await step(`href is ${item.expectedPath}`, () =>
        expect(link).toHaveAttribute('href', item.expectedPath),
      );
      const response = await step(`Navigate to ${item.expectedPath}`, () =>
        page.goto(item.expectedPath, { waitUntil: 'domcontentloaded' }),
      );
      await step('HTTP status < 400', () => expect(response?.status() ?? 200).toBeLessThan(400));
      await step('Page renders a heading', () =>
        expect(page.locator('main h1, main h2').first()).toBeVisible(),
      );
    });
  }
});
