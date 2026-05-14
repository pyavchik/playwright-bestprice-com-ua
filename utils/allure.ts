import { allure } from 'allure-playwright';

/**
 * Severity levels supported by Allure. Re-exported as a string-union so tests
 * don't have to depend on allure-js-commons enums directly.
 */
export type AllureSeverity = 'blocker' | 'critical' | 'normal' | 'minor' | 'trivial';

interface AllureMeta {
  epic?: string;
  feature?: string;
  story?: string;
  description?: string;
  severity?: AllureSeverity;
  tags?: string[];
  links?: { url: string; name?: string; type?: string }[];
}

/**
 * Apply a block of Allure metadata to the current test in a single call,
 * keeping spec files readable. Use at the top of a `test()` body.
 *
 * Example:
 *   allureMeta({
 *     epic: 'Cart',
 *     feature: 'Add to cart',
 *     story: 'User adds a product from search results',
 *     description: 'Verifies that adding a product from a search-result card ' +
 *                  'increments the header cart counter and surfaces the product ' +
 *                  'on the /koshyk page.',
 *     severity: 'critical',
 *   });
 */
export async function allureMeta(meta: AllureMeta): Promise<void> {
  if (meta.epic) await allure.epic(meta.epic);
  if (meta.feature) await allure.feature(meta.feature);
  if (meta.story) await allure.story(meta.story);
  if (meta.description) await allure.description(meta.description);
  if (meta.severity) await allure.severity(meta.severity);
  for (const tag of meta.tags ?? []) await allure.tag(tag);
  for (const link of meta.links ?? [])
    await allure.link(link.url, link.name ?? link.url, link.type ?? 'link');
}

/**
 * Convenience step wrapper — every action becomes a collapsible row in Allure.
 * Screenshots, videos, traces and the error-context markdown are auto-attached
 * by allure-playwright on failure, so tests don't need to wire those manually.
 */
export async function step<T>(title: string, body: () => Promise<T> | T): Promise<T> {
  let result: T;
  await allure.step(title, async () => {
    result = await body();
  });
  // Asserted by the await above: result is always assigned before resolution.
  return result!;
}
