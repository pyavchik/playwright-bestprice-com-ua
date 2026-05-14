import { expect, type Page } from '@playwright/test';
import type { HeaderComponent } from '../pages/header-component';
import type { SearchPage } from '../pages/search-page';
import { searchTerms } from '../test-data/search-terms';
import { step } from './allure';

/**
 * Search for a product and add the first result to the cart.
 *
 * Shared setup for cart and checkout flows. Captures the search keyword and the
 * post-add cart counter so callers can assert in a single line.
 *
 * @returns the resolved keyword (so callers can compare it back, if needed)
 */
export async function searchAndAddFirstResultToCart({
  page,
  header,
  searchPage,
  keyword = searchTerms.valid[0],
}: {
  page: Page;
  header: HeaderComponent;
  searchPage: SearchPage;
  keyword?: string;
}): Promise<string> {
  await step(`Search for "${keyword}"`, () => header.search(keyword));
  await step('Wait for results', () =>
    expect(searchPage.firstAddToCartButton).toBeVisible({ timeout: 15_000 }),
  );
  await step('Add the first result to cart', () => searchPage.firstAddToCartButton.click());
  await step('Header cart counter reads 1', () =>
    expect.poll(() => header.getCartCount(), { timeout: 10_000 }).toBe(1),
  );
  // `page` argument intentionally received to allow callers that want to
  // navigate to /koshyk in their own step ordering.
  void page;
  return keyword;
}
