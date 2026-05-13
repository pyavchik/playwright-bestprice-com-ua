import { test, expect } from '../fixtures/pages-fixture';

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
    await homePage.footer.root.scrollIntoViewIfNeeded();
    await expect(homePage.footer.phoneLinks.first()).toBeVisible();
    await expect(homePage.footer.emailLinks.first()).toBeVisible();
  });

  for (const item of FOOTER_PAGES) {
    test(`Footer link opens ${item.label} page`, async ({ page, homePage }) => {
      await homePage.footer.root.scrollIntoViewIfNeeded();
      const link = homePage.footer.link(item.name).first();
      await expect(link).toBeVisible();
      const href = await link.getAttribute('href');
      expect(href).toBe(item.expectedPath);
      const response = await page.goto(item.expectedPath, { waitUntil: 'domcontentloaded' });
      expect(response?.status() ?? 200).toBeLessThan(400);
      await expect(page.locator('main h1, main h2').first()).toBeVisible();
    });
  }
});
