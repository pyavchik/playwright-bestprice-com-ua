import type { Page } from '@playwright/test';

/**
 * Best-effort dismissal of overlays that can intercept clicks on bestprice.com.ua:
 * - "Встановити BestPrice" PWA install dialog (close button has aria-label="Закрити")
 * - Cookie/GDPR banners (generic patterns kept as fallback)
 */
export async function dismissOverlays(page: Page): Promise<void> {
  const candidates = [
    page.getByRole('dialog', { name: /встановити bestprice/i }).getByRole('button', { name: /закрити/i }),
    page.getByRole('button', { name: /^закрити$/i }),
    page.getByRole('button', { name: /прийн|accept|погод|згод/i }),
  ];

  for (const candidate of candidates) {
    const first = candidate.first();
    if ((await first.count()) === 0) continue;
    if (!(await first.isVisible().catch(() => false))) continue;
    await first.click({ timeout: 2_000 }).catch(() => undefined);
  }
}

// Backwards-compatible alias kept for callers that imported the old name.
export const dismissCookieBanner = dismissOverlays;
