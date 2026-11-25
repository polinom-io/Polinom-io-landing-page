import { test, expect } from "@playwright/test";

const SITE_URL = "https://polinom.io";

const BLOGS = [
  {
    label: "English",
    lang: "en",
    home: "/",
    index: "/blog/",
    heading: "Blog",
    posts: [
      { slug: "four-terms", title: "The four terms: how we scope an engagement" },
      { slug: "building-in-public", title: "Why this site is the case study" },
    ],
  },
  {
    label: "Spanish",
    lang: "es",
    home: "/es/",
    index: "/es/blog/",
    heading: "Blog",
    posts: [
      { slug: "four-terms", title: "Los cuatro términos: cómo definimos el alcance de un proyecto" },
      { slug: "building-in-public", title: "Por qué este sitio es el caso de estudio" },
    ],
  },
] as const;

for (const blog of BLOGS) {
  test.describe(`Blog — ${blog.label}`, () => {
    test("index lists every post with a link to it", async ({ page }) => {
      await page.goto(blog.index);
      await expect(page.locator("html")).toHaveAttribute("lang", blog.lang);
      await expect(page.locator("main h1")).toHaveText(blog.heading);
      for (const { slug, title } of blog.posts) {
        await expect(page.locator(`a[href="${blog.index}${slug}/"]`)).toContainText(title);
      }
    });

    test("index is reachable from the navigation", async ({ page }) => {
      await page.setViewportSize({ width: 1280, height: 800 });
      await page.goto(blog.home);
      await page.locator(`nav.links a[href="${blog.index}"]`).click();
      await expect(page).toHaveURL(new RegExp(`${blog.index}$`));
    });

    test("index declares both language alternates", async ({ page }) => {
      await page.goto(blog.index);
      expect(await page.locator('head link[rel="canonical"]').getAttribute("href")).toBe(`${SITE_URL}${blog.index}`);
      expect(await page.locator('head link[hreflang="en"]').getAttribute("href")).toBe(`${SITE_URL}/blog/`);
      expect(await page.locator('head link[hreflang="es"]').getAttribute("href")).toBe(`${SITE_URL}/es/blog/`);
    });

    for (const { slug, title } of blog.posts) {
      test(`renders the "${slug}" post linked to its translation`, async ({ page }) => {
        await page.goto(`${blog.index}${slug}/`);
        await expect(page.locator("html")).toHaveAttribute("lang", blog.lang);
        await expect(page.locator("article h1")).toHaveText(title);
        await expect(page.locator("article time")).toHaveAttribute("datetime", /^\d{4}-\d{2}-\d{2}/);
        await expect(page.locator(`article a[href="${blog.index}"]`)).toBeVisible();
        expect(await page.locator('head link[hreflang="en"]').getAttribute("href")).toBe(`${SITE_URL}/blog/${slug}/`);
        expect(await page.locator('head link[hreflang="es"]').getAttribute("href")).toBe(`${SITE_URL}/es/blog/${slug}/`);
        const otherIndex = blog.lang === "en" ? "/es/blog/" : "/blog/";
        await expect(page.locator(".lang-toggle")).toHaveAttribute("href", `${otherIndex}${slug}/`);
      });
    }

    test("nav section links go back to the home sections", async ({ page }) => {
      await page.goto(blog.index);
      await expect(page.locator(`nav.links a[href="${blog.home}#services"]`)).toHaveCount(1);
    });
  });
}
