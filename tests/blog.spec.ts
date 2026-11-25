import { test, expect } from "@playwright/test";

const SITE_URL = "https://polinom.io";

const POSTS = [
  { slug: "four-terms", title: "The four terms: how we scope an engagement" },
  { slug: "building-in-public", title: "Why this site is the case study" },
] as const;

test.describe("Blog index", () => {
  test("lists every English post with a link to it", async ({ page }) => {
    await page.goto("/blog/");
    await expect(page.locator("html")).toHaveAttribute("lang", "en");
    await expect(page.locator("h1")).toHaveText("Blog");
    for (const { slug, title } of POSTS) {
      await expect(page.locator(`a[href="/blog/${slug}/"]`)).toContainText(title);
    }
  });

  test("is reachable from the English navigation", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto("/");
    await page.locator('nav.links a[href="/blog/"]').click();
    await expect(page).toHaveURL(/\/blog\/$/);
  });

  test("has no Spanish alternate until translations exist", async ({ page }) => {
    await page.goto("/blog/");
    await expect(page.locator('head link[hreflang="es"]')).toHaveCount(0);
    expect(await page.locator('head link[rel="canonical"]').getAttribute("href")).toBe(`${SITE_URL}/blog/`);
  });
});

for (const { slug, title } of POSTS) {
  test(`renders the "${slug}" post`, async ({ page }) => {
    await page.goto(`/blog/${slug}/`);
    await expect(page.locator("article h1")).toHaveText(title);
    await expect(page.locator("article time")).toHaveAttribute("datetime", /^\d{4}-\d{2}-\d{2}/);
    await expect(page.locator('article a[href="/blog/"]')).toBeVisible();
  });
}

test("nav section links from a blog page go back to the home sections", async ({ page }) => {
  await page.goto("/blog/");
  await expect(page.locator('nav.links a[href="/#services"]')).toHaveCount(1);
});
