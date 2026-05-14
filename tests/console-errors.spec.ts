import { test, expect } from '../fixtures/pages-fixture';
import { allureMeta, step } from '../utils/allure';

test.describe('@regression Console errors', () => {
  test('Home page has no critical console errors', async ({ homePage, consoleLogger }) => {
    await allureMeta({
      epic: 'Stability',
      feature: 'Console errors',
      story: 'Homepage produces no critical JS errors',
      description:
        'Reloads the homepage, scrolls the footer into view to trigger lazy-loaded code paths, ' +
        'and asserts that the captured pageerror/console.error stream contains no entries beyond ' +
        'the known-non-critical noise (analytics, hydration warnings, transient chunk loads).',
      severity: 'normal',
    });

    await step('Reload homepage', () => homePage.reload());
    await step('Wait for hydration', () => homePage.waitForReady());
    await step('Scroll footer into view', () =>
      homePage.footer.root.scrollIntoViewIfNeeded().catch(() => undefined),
    );
    const critical = consoleLogger.getCriticalErrors();
    await step('No critical console errors', () =>
      expect(critical, JSON.stringify(critical, null, 2)).toEqual([]),
    );
  });
});
