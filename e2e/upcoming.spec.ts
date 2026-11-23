import { expect, test } from "@playwright/test";

test.describe("upcoming calendar", () => {
  test("shows every day of the month and bursts a day open", async ({
    page,
  }) => {
    await page.goto("/");
    await page.getByRole("link", { name: "Upcoming" }).click();
    await expect(page).toHaveURL(/\/upcoming$/);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(
      /^[A-Z][a-z]+ \d{4}$/,
    );

    // Pick the busiest day so the burst has plenty of posters.
    const days = page.locator('button[aria-label*="on day"]');
    await expect(days.first()).toBeVisible();
    const labels = await days.evaluateAll((els) =>
      els.map((el) => el.getAttribute("aria-label") ?? ""),
    );
    const counts = labels.map((l) => parseInt(l, 10));
    const busiest = counts.indexOf(Math.max(...counts));

    await days.nth(busiest).click();
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await expect(dialog.locator('a[href^="/movie/"]')).toHaveCount(
      counts[busiest]!,
    );

    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
    // Focus returns to the day that opened it.
    await expect(days.nth(busiest)).toBeFocused();
  });

  test("navigates between months but not into the past", async ({ page }) => {
    await page.goto("/upcoming");
    const title = page.getByRole("heading", { level: 1 });
    const thisMonth = await title.textContent();

    await page.getByRole("link", { name: "Next month" }).click();
    await expect(page).toHaveURL(/month=\d{4}-\d{2}/);
    await expect(title).not.toHaveText(thisMonth!);

    await page.getByRole("link", { name: "Previous month" }).click();
    await expect(title).toHaveText(thisMonth!);
    await expect(
      page.getByRole("link", { name: "Previous month" }),
    ).toHaveCount(0);

    await page.goto("/upcoming?month=2000-01");
    await expect(page).toHaveURL(/\/upcoming$/);
  });
});
