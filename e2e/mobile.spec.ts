import { expect, test } from "@playwright/test";

test.describe("mobile", () => {
  test("home fits the screen and carousels swipe", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText("#1 trending today")).toBeVisible();

    // No horizontal page scroll at phone width.
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - window.innerWidth,
    );
    expect(overflow).toBeLessThanOrEqual(0);

    const row = page.getByRole("region", { name: "Trending today" });
    const scroller = row.locator(".overflow-x-auto");
    await scroller.evaluate((el) => el.scrollBy({ left: 2000 }));
    await expect
      .poll(() => row.locator('a[href^="/movie/"]').count(), {
        timeout: 15_000,
      })
      .toBeGreaterThan(10);
  });

  test("the calendar shows counts on small screens", async ({ page }) => {
    await page.goto("/upcoming");
    const day = page.locator('button[aria-label*="on day"]').first();
    await expect(day).toBeVisible({ timeout: 20_000 }); // cold cache allowance
    await day.click();
    await expect(page.getByRole("dialog")).toBeVisible();
  });
});
