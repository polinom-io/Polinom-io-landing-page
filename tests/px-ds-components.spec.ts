import { expect, test } from "@playwright/test";

for (const path of ["/", "/es/"]) {
  test.describe(`px-ds components — ${path}`, () => {
    test("services render as four px-ds Cards with exponent chips", async ({ page }) => {
      await page.goto(path);
      const cards = page.locator("#services .px-card");
      await expect(cards).toHaveCount(4);
      await expect(cards.locator(".px-card__exp")).toHaveCount(4);
      await expect(cards.locator("h3.px-card__title")).toHaveCount(4);
      await expect(page.locator(".term-card")).toHaveCount(0);
    });

    test("the hero uses the px-ds CurveDivider, hidden from assistive tech", async ({ page }) => {
      await page.goto(path);
      const curve = page.locator(".px-curve svg");
      await expect(curve).toHaveCount(1);
      await expect(curve).toHaveAttribute("aria-hidden", "true");
      await expect(page.locator(".curve-divider")).toHaveCount(0);
    });
  });
}

test("the curve's end dot stays inside the viewport", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto("/");
  const dot = page.locator(".px-curve circle").last();
  const box = await dot.boundingBox();
  expect(box).not.toBeNull();
  // px-ds draws the end dot at cx=1196 r=4.5 in a 1200-wide viewBox, so at full
  // bleed it reaches ~0.5px past the edge; anything beyond 1px is a real clip.
  expect(box!.x + box!.width).toBeLessThanOrEqual(1281);
});
