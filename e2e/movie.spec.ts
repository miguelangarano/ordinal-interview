import { expect, test } from "@playwright/test";

test.describe("movie details", () => {
  test("opens from the home page with credits, cast and more", async ({
    page,
  }) => {
    await page.goto("/");
    const card = page
      .getByRole("region", { name: "Trending today" })
      .locator('a[href^="/movie/"]')
      .first();
    const href = await card.getAttribute("href");

    await card.click();
    await expect(page).toHaveURL(href!);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Where to watch" }),
    ).toBeVisible();
    await expect(page.getByRole("heading", { name: "Top cast" })).toBeVisible();
  });

  test("plays the trailer in a dialog and links cast to Wikipedia", async ({
    page,
  }) => {
    // Dune: Part Two has a trailer, a well-known cast and streaming options.
    await page.goto("/movie/693134");
    await expect(page.getByRole("heading", { level: 1 })).toContainText(
      "Dune: Part Two",
    );

    await page.getByRole("button", { name: "Watch trailer" }).click();
    const dialog = page.getByRole("dialog");
    await expect(dialog.locator('iframe[src*="youtube"]')).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();

    const wiki = page.locator('a[href^="https://en.wikipedia.org/wiki/"]');
    await expect(wiki.first()).toBeVisible({ timeout: 15_000 });
    await expect(wiki.first()).toHaveAttribute("target", "_blank");
  });

  test("unknown movies show the not-found page", async ({ page }) => {
    await page.goto("/movie/999999999");
    await expect(page.getByText("Scene missing")).toBeVisible();
  });
});
