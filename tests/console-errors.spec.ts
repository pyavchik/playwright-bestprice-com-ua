import { test, expect } from '../fixtures/pages-fixture';

test.describe('@regression Console errors', () => {
  test('Home page has no critical console errors', async ({ homePage, consoleLogger }) => {
    await homePage.reload();
    await homePage.waitForReady();
    await homePage.footer.root.scrollIntoViewIfNeeded().catch(() => undefined);
    const critical = consoleLogger.getCriticalErrors();
    expect(critical, JSON.stringify(critical, null, 2)).toEqual([]);
  });
});
