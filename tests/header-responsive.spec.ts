import { test, expect } from "@playwright/test";

/**
 * Regression coverage for a real bug: `.nav { padding: 1.1rem 0 }` and
 * `.wrap { padding: 0 2rem }` both apply to the header element
 * (class="wrap nav"). Because they have equal specificity and `.nav` is
 * declared later, its `0` horizontal padding silently won the cascade,
 * leaving the header flush against the viewport edge on every screen
 * narrower than ~1184px — which is every phone and most laptop windows.
 * It went unnoticed because `.wrap`'s max-width: 1120px auto-centering
 * happens to create a lookalike gutter on wide viewports.
 */

const PAGES = [
  { label: "English", path: "/" },
  { label: "Spanish", path: "/es/" },
];

// A phone-sized viewport (no wider than the `nav.links` breakpoint at 720px)
// and a viewport just under the site's 1120px content max-width, to confirm
// the fix holds generally rather than at one specific pixel width.
const NARROW_VIEWPORTS = [
  { label: "mobile", width: 375, height: 812 },
  { label: "narrow desktop", width: 900, height: 800 },
];

const MIN_HEADER_INSET_PX = 16;

for (const { label: pageLabel, path } of PAGES) {
  test.describe(`Header spacing — ${pageLabel}`, () => {
    for (const { label: viewportLabel, width, height } of NARROW_VIEWPORTS) {
      test(`wordmark and toggle group keep a margin from the viewport edge (${viewportLabel}, ${width}px)`, async ({
        page,
      }) => {
        await page.setViewportSize({ width, height });
        await page.goto(path);

        const wordmark = page.locator(".wordmark").first();
        const toggleGroup = page.locator(".toggle-group");

        const wordmarkBox = await wordmark.boundingBox();
        const toggleBox = await toggleGroup.boundingBox();
        expect(wordmarkBox).not.toBeNull();
        expect(toggleBox).not.toBeNull();

        expect(wordmarkBox!.x).toBeGreaterThanOrEqual(MIN_HEADER_INSET_PX);

        const toggleRightInset = width - (toggleBox!.x + toggleBox!.width);
        expect(toggleRightInset).toBeGreaterThanOrEqual(MIN_HEADER_INSET_PX);
      });
    }

    test("no horizontal overflow on mobile", async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 812 });
      await page.goto(path);

      const { scrollWidth, clientWidth } = await page.evaluate(() => ({
        scrollWidth: document.documentElement.scrollWidth,
        clientWidth: document.documentElement.clientWidth,
      }));

      expect(scrollWidth).toBeLessThanOrEqual(clientWidth);
    });

    test("nav links collapse below 720px but header controls stay reachable", async ({
      page,
    }) => {
      await page.setViewportSize({ width: 375, height: 812 });
      await page.goto(path);

      await expect(page.locator("nav.links")).toBeHidden();
      await expect(page.locator("#langToggle, .lang-toggle")).toBeVisible();
      await expect(page.locator("#themeToggle")).toBeVisible();
    });
  });
}
