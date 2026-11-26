import { expect, test } from "@playwright/test";

test.describe("Theme toggle", () => {
  test("a stored override applies before scripts in the body run", async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem("polinom-theme", "dark"));
    await page.emulateMedia({ colorScheme: "light" });
    await page.goto("/");
    await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
    const scheme = await page.evaluate(() => getComputedStyle(document.documentElement).colorScheme);
    expect(scheme).toBe("dark");
  });

  test("toggling back to the system scheme drops the override", async ({ page }) => {
    await page.emulateMedia({ colorScheme: "light" });
    await page.goto("/");
    const toggle = page.locator("#themeToggle");

    await toggle.click();
    await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
    expect(await page.evaluate(() => localStorage.getItem("polinom-theme"))).toBe("dark");

    await toggle.click();
    await expect(page.locator("html")).not.toHaveAttribute("data-theme", /.*/);
    expect(await page.evaluate(() => localStorage.getItem("polinom-theme"))).toBeNull();
  });

  test("an override is kept when the system scheme later matches it", async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem("polinom-theme", "dark"));
    await page.emulateMedia({ colorScheme: "dark" });
    await page.goto("/");
    await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
    expect(await page.evaluate(() => localStorage.getItem("polinom-theme"))).toBe("dark");
  });
});
