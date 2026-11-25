import { test, expect } from "@playwright/test";

const PAGES = [
  { label: "English", lang: "en", home: "/", path: "/privacy/", heading: "Privacy Policy", footerLabel: "Privacy" },
  { label: "Spanish", lang: "es", home: "/es/", path: "/es/privacy/", heading: "Política de Privacidad", footerLabel: "Privacidad" },
] as const;

for (const { label, lang, home, path, heading, footerLabel } of PAGES) {
  test.describe(`Privacy policy — ${label}`, () => {
    test("renders in its language with every section", async ({ page }) => {
      await page.goto(path);
      await expect(page.locator("html")).toHaveAttribute("lang", lang);
      await expect(page.locator("main h1")).toHaveText(heading);
      await expect(page.locator("main h2")).toHaveCount(5);
    });

    test("is linked from the footer of the home page", async ({ page }) => {
      await page.goto(home);
      const link = page.locator(`footer a[href="${path}"]`);
      await expect(link).toHaveText(footerLabel);
    });

    test("language toggle goes to the other language's policy", async ({ page }) => {
      await page.goto(path);
      const otherPath = lang === "en" ? "/es/privacy/" : "/privacy/";
      await expect(page.locator(".lang-toggle")).toHaveAttribute("href", otherPath);
    });
  });
}
