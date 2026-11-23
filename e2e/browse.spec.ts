import { expect, test } from "@playwright/test";

const movieCards = "main a[href^='/movie/']";

test.describe("categories and search", () => {
  test("a category shows the top 50 and loads more on scroll", async ({
    page,
  }) => {
    await page.goto("/");
    const nav = page.getByRole("navigation", { name: "Categories" });
    const first = nav.locator('a[href^="/category/"]').first();
    const name = (await first.textContent())!.trim();

    await first.click();
    await expect(page).toHaveURL(/\/category\/\d+$/);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(name);
    await expect(first).toHaveAttribute("aria-current", "page");
    await expect(page.locator(movieCards)).toHaveCount(50);

    await page.mouse.wheel(0, 100_000);
    await expect
      .poll(() => page.locator(movieCards).count(), { timeout: 20_000 })
      .toBeGreaterThan(50);
  });

  test("the More menu lists the remaining categories", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "More" }).click();

    const items = page.getByRole("menuitem");
    await expect(items.first()).toBeVisible();
    expect(await items.count()).toBeGreaterThan(5);

    const label = (await items.first().textContent())!.trim();
    await items.first().click();
    await expect(page).toHaveURL(/\/category\/\d+$/);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(label);
  });

  test("search shows 50 results, and clearing it returns home", async ({
    page,
  }) => {
    await page.goto("/");
    const box = page.getByRole("searchbox", { name: "Search movies" });

    await box.fill("batman");
    await expect(page).toHaveURL(/\/search\?q=batman$/);
    await expect(page.getByText(/results for “batman”/)).toBeVisible();
    await expect(page.locator(movieCards)).toHaveCount(50);

    await box.fill("");
    await expect(page).toHaveURL(/\/$/);
    await expect(page.getByText("#1 trending today")).toBeVisible();
  });

  test("an empty /search redirects home", async ({ page }) => {
    await page.goto("/search");
    await expect(page).toHaveURL(/\/$/);
  });
});
