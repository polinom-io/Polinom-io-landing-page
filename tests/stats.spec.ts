import { test, expect } from "@playwright/test";

const PAGES = [
  { label: "English", path: "/", lighthouse: "Lighthouse", thirdParty: "Third-party" },
  { label: "Spanish", path: "/es/", lighthouse: "Lighthouse", thirdParty: "terceros" },
] as const;

const VERIFIABLE_FIGURES = ["100", "100%", "0"] as const;
const INVENTED_FIGURES = /40\+|3\.1×|98%|ROI|renewal|renovación|industr/i;

for (const { label, path, lighthouse, thirdParty } of PAGES) {
  test.describe(`Stats — ${label}`, () => {
    test("shows only the three verifiable figures", async ({ page }) => {
      await page.goto(path);
      const figures = page.locator(".stats-row .px-stat .px-stat__figure");
      await expect(figures).toHaveText([...VERIFIABLE_FIGURES]);
    });

    test("labels name what each figure measures", async ({ page }) => {
      await page.goto(path);
      const labels = page.locator(".stats-row .px-stat .px-stat__label");
      await expect(labels.nth(0)).toContainText(lighthouse);
      await expect(labels.nth(2)).toContainText(thirdParty);
    });

    test("uses the px-ds Stat instead of the local markup", async ({ page }) => {
      await page.goto(path);
      await expect(page.locator(".stats-row .px-stat")).toHaveCount(3);
      await expect(page.locator(".stats-row .stat")).toHaveCount(0);
    });

    test("has no invented track-record figures", async ({ page }) => {
      await page.goto(path);
      await expect(page.locator(".stats-row")).not.toContainText(INVENTED_FIGURES);
    });
  });
}
