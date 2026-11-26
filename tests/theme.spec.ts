import { expect, test } from "@playwright/test";

// px-ds contract: the brand theme lives on data-theme="px" and the colour mode
// on data-mode. No data-mode means "follow the system".
test.describe("Theme and mode attributes", () => {
  for (const path of ["/", "/es/", "/blog/", "/privacy/"]) {
    test(`${path} always carries the px brand theme`, async ({ page }) => {
      await page.goto(path);
      await expect(page.locator("html")).toHaveAttribute("data-theme", "px");
    });
  }

  test("no mode attribute by default, so the system scheme applies", async ({ page }) => {
    await page.emulateMedia({ colorScheme: "dark" });
    await page.goto("/");
    await expect(page.locator("html")).not.toHaveAttribute("data-mode", /.*/);
  });
});

test.describe("Mode toggle", () => {
  test("a stored override applies before scripts in the body run", async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem("px-mode", "dark"));
    await page.emulateMedia({ colorScheme: "light" });
    await page.goto("/");
    await expect(page.locator("html")).toHaveAttribute("data-mode", "dark");
    await expect(page.locator("html")).toHaveAttribute("data-theme", "px");
    const scheme = await page.evaluate(() => getComputedStyle(document.documentElement).colorScheme);
    expect(scheme).toBe("dark");
  });

  test("toggling back to the system scheme drops the override", async ({ page }) => {
    await page.emulateMedia({ colorScheme: "light" });
    await page.goto("/");
    const toggle = page.locator("#themeToggle");

    await toggle.click();
    await expect(page.locator("html")).toHaveAttribute("data-mode", "dark");
    expect(await page.evaluate(() => localStorage.getItem("px-mode"))).toBe("dark");

    await toggle.click();
    await expect(page.locator("html")).not.toHaveAttribute("data-mode", /.*/);
    await expect(page.locator("html")).toHaveAttribute("data-theme", "px");
    expect(await page.evaluate(() => localStorage.getItem("px-mode"))).toBeNull();
  });

  test("an override is kept when the system scheme later matches it", async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem("px-mode", "dark"));
    await page.emulateMedia({ colorScheme: "dark" });
    await page.goto("/");
    await expect(page.locator("html")).toHaveAttribute("data-mode", "dark");
    expect(await page.evaluate(() => localStorage.getItem("px-mode"))).toBe("dark");
  });

  test("the light override wins over a dark system scheme", async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem("px-mode", "light"));
    await page.emulateMedia({ colorScheme: "dark" });
    await page.goto("/");
    await expect(page.locator("html")).toHaveAttribute("data-mode", "light");
    const scheme = await page.evaluate(() => getComputedStyle(document.documentElement).colorScheme);
    expect(scheme).toBe("light");
  });
});

test.describe("Legacy mode key migration", () => {
  test("an override saved under polinom-theme moves to px-mode before paint", async ({ page }) => {
    await page.addInitScript(() => {
      // Only seed on the first load, so the reload below sees the migrated state.
      if (!sessionStorage.getItem("seeded")) {
        localStorage.setItem("polinom-theme", "dark");
        sessionStorage.setItem("seeded", "1");
      }
    });
    await page.emulateMedia({ colorScheme: "light" });
    await page.goto("/");
    await expect(page.locator("html")).toHaveAttribute("data-mode", "dark");
    expect(await page.evaluate(() => localStorage.getItem("px-mode"))).toBe("dark");
    expect(await page.evaluate(() => localStorage.getItem("polinom-theme"))).toBeNull();

    await page.reload();
    await expect(page.locator("html")).toHaveAttribute("data-mode", "dark");
  });

  test("px-mode wins when both keys exist", async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem("polinom-theme", "dark");
      localStorage.setItem("px-mode", "light");
    });
    await page.emulateMedia({ colorScheme: "dark" });
    await page.goto("/");
    await expect(page.locator("html")).toHaveAttribute("data-mode", "light");
    expect(await page.evaluate(() => localStorage.getItem("polinom-theme"))).toBeNull();
  });

  test("an invalid legacy value is dropped, not migrated", async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem("polinom-theme", "sepia"));
    await page.goto("/");
    await expect(page.locator("html")).not.toHaveAttribute("data-mode", /.*/);
    expect(await page.evaluate(() => localStorage.getItem("px-mode"))).toBeNull();
    expect(await page.evaluate(() => localStorage.getItem("polinom-theme"))).toBeNull();
  });
});
