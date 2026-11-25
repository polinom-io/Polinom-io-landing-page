import { test, expect } from "@playwright/test";

// The sitemap is generated at build time only, so check the built output
// rather than the dev server.
import { existsSync, readFileSync } from "node:fs";

test("robots.txt points crawlers at the sitemap index", async ({ request }) => {
  const body = await (await request.get("/robots.txt")).text();
  expect(body).toContain("Sitemap: https://polinom.io/sitemap-index.xml");
});

test("built sitemap lists the home pages and blog posts in both languages", () => {
  test.skip(!existsSync("dist/sitemap-0.xml"), "run `npm run build` first");
  const sitemap = readFileSync("dist/sitemap-0.xml", "utf8");
  for (const path of ["/", "/es/", "/blog/", "/blog/four-terms/", "/blog/building-in-public/", "/es/blog/", "/es/blog/four-terms/", "/es/blog/building-in-public/"]) {
    expect(sitemap).toContain(`<loc>https://polinom.io${path}</loc>`);
  }
  expect(sitemap).not.toContain("404");
});
