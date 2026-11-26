import { expect, test, type Page } from "@playwright/test";

async function tokenValue(page: Page, token: string): Promise<string> {
  // Resolve a px-ds token to the computed colour the browser would paint.
  return page.evaluate((name) => {
    const probe = document.createElement("div");
    probe.style.color = `var(${name})`;
    document.body.append(probe);
    const value = getComputedStyle(probe).color;
    probe.remove();
    return value;
  }, token);
}

for (const mode of ["light", "dark"] as const) {
  test.describe(`px-ds tokens — ${mode} mode`, () => {
    test.beforeEach(async ({ page }) => {
      await page.emulateMedia({ colorScheme: mode });
    });

    for (const path of ["/", "/es/"]) {
      test(`${path} paints the page and text with px-ds tokens`, async ({ page }) => {
        await page.goto(path);
        const body = page.locator("body");
        const pageColour = await tokenValue(page, "--color-surface-page");
        const textColour = await tokenValue(page, "--color-text-default");
        await expect(body).toHaveCSS("background-color", pageColour);
        await expect(body).toHaveCSS("color", textColour);
      });
    }
  });
}

test("body text uses the px-ds body font and headings the brand font", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("body")).toHaveCSS("font-family", /Atkinson Hyperlegible Next/);
  await expect(page.locator("main h1").first()).toHaveCSS("font-family", /Atkinson Hyperlegible Next/);
  await expect(page.locator(".equation")).toHaveCSS("font-family", /Hack/);
});

test("Monaspace Xenon is gone", async ({ page }) => {
  const fontRequests: string[] = [];
  page.on("request", (request) => {
    if (request.resourceType() === "font") fontRequests.push(request.url());
  });
  await page.goto("/");
  await page.evaluate(() => document.fonts.ready);
  expect(fontRequests.filter((url) => /monaspace/i.test(url))).toEqual([]);
  const families = await page.evaluate(() => [...document.fonts].map((face) => face.family));
  expect(families.join(",")).not.toMatch(/Monaspace/);
});

test("equation terms carry no per-term colours (px-ds v0.26)", async ({ page }) => {
  await page.goto("/");
  const colours = await page
    .locator(".equation .term")
    .evaluateAll((terms) => terms.map((term) => getComputedStyle(term).color));
  expect(colours).toHaveLength(4);
  expect(new Set(colours).size).toBe(1);
});
