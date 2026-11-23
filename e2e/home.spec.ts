import { expect, test } from "@playwright/test";

test.describe("home", () => {
  test("shows the #1 trending movie and the rows in order", async ({
    page,
  }) => {
    await page.goto("/");

    await expect(page.getByText("#1 trending today")).toBeVisible();
    await expect(
      page.getByRole("link", { name: /view details/i }),
    ).toBeVisible();

    const rows = page.locator("main section[aria-label] h2");
    await expect(rows.nth(0)).toHaveText("Trending today");
    await expect(rows.nth(1)).toHaveText("Popular");
    // Rows 3+ are the categories shown in the header bar, in the same order.
    const categories = await page
      .getByRole("navigation", { name: "Categories" })
      .locator('a[href^="/category/"]')
      .allTextContents();
    expect(categories).toHaveLength(5);
    await expect(rows).toHaveText(["Trending today", "Popular", ...categories]);
  });

  test("the trending row starts with 10 and loads 10 more at the end", async ({
    page,
  }) => {
    await page.goto("/");
    const row = page.getByRole("region", { name: "Trending today" });
    const cards = row.locator('a[href^="/movie/"]');

    await expect(cards).toHaveCount(10);
    await expect(cards.first()).toContainText(/./);

    // Page right through the row; reaching the 10th card fetches the next batch.
    await row.hover();
    const next = row.getByRole("button", { name: "Next Trending today" });
    for (let i = 0; i < 3; i++) {
      await next.click();
      await page.waitForTimeout(500);
    }
    await expect
      .poll(() => cards.count(), { timeout: 15_000 })
      .toBeGreaterThan(10);

    const previous = row.getByRole("button", {
      name: "Previous Trending today",
    });
    await expect(previous).toBeVisible();
  });
});
