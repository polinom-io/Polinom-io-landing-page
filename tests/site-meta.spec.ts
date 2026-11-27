import { test, expect, type Page } from "@playwright/test";

const SITE_URL = "https://polinom.io";

const PAGES = [
  { label: "English", path: "/", lang: "en" },
  { label: "Spanish", path: "/es/", lang: "es" },
] as const;

async function headHref(page: Page, selector: string): Promise<string | null> {
  return page.locator(`head ${selector}`).getAttribute("href");
}

for (const { label, path, lang } of PAGES) {
  test.describe(`Head metadata — ${label}`, () => {
    test("links the favicon set", async ({ page }) => {
      await page.goto(path);
      expect(await headHref(page, 'link[rel="icon"][type="image/svg+xml"]')).toBe("/favicon.svg");
      expect(await headHref(page, 'link[rel="icon"][sizes="32x32"]')).toBe("/favicon-32.png");
      expect(await headHref(page, 'link[rel="apple-touch-icon"]')).toBe("/apple-touch-icon.png");
    });

    test("declares canonical and hreflang alternates on the production site", async ({ page }) => {
      await page.goto(path);
      expect(await headHref(page, 'link[rel="canonical"]')).toBe(`${SITE_URL}${path}`);
      expect(await headHref(page, 'link[hreflang="en"]')).toBe(`${SITE_URL}/`);
      expect(await headHref(page, 'link[hreflang="es"]')).toBe(`${SITE_URL}/es/`);
      expect(await headHref(page, 'link[hreflang="x-default"]')).toBe(`${SITE_URL}/`);
    });

    test("declares Open Graph and Twitter card tags", async ({ page }) => {
      await page.goto(path);
      const meta = (property: string) =>
        page.locator(`head meta[property="${property}"], head meta[name="${property}"]`).getAttribute("content");
      expect(await meta("og:image")).toBe(`${SITE_URL}/og-image.png`);
      expect(await meta("og:url")).toBe(`${SITE_URL}${path}`);
      expect(await meta("og:locale")).toBe(lang === "en" ? "en_US" : "es_CL");
      expect(await meta("og:title")).toBeTruthy();
      expect(await meta("og:description")).toBeTruthy();
      expect(await meta("twitter:card")).toBe("summary_large_image");
    });
  });
}

test.describe("Static assets", () => {
  for (const asset of ["/favicon.svg", "/favicon-32.png", "/apple-touch-icon.png", "/og-image.png", "/robots.txt"]) {
    test(`serves ${asset}`, async ({ request }) => {
      const response = await request.get(asset);
      expect(response.status()).toBe(200);
    });
  }

  test("robots.txt allows crawling", async ({ request }) => {
    const body = await (await request.get("/robots.txt")).text();
    expect(body).toContain("User-agent: *");
    expect(body).toContain("Allow: /");
  });
});

test.describe("404 page", () => {
  test("unknown paths render the not-found page with a link home", async ({ page }) => {
    const response = await page.goto("/this-page-does-not-exist/");
    expect(response?.status()).toBe(404);
    await expect(page.locator("main h1")).toHaveText("Page not found");
    await expect(page.locator('main a[href="/"]')).toBeVisible();
  });
});
