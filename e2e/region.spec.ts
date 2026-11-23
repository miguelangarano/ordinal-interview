import { expect, test } from "@playwright/test";

test.describe("region", () => {
  test("picking a region updates where-to-watch and the calendar", async ({
    page,
    context,
  }) => {
    await page.goto("/movie/693134"); // Dune: Part Two
    const picker = page.getByRole("button", { name: /^Region:/ });
    await expect(picker).toContainText("US");

    await picker.click();
    await page.getByRole("menuitemradio", { name: /United Kingdom/ }).click();

    await expect(picker).toContainText("GB");
    await expect(
      page.getByText(
        /Availability in United Kingdom|options in United Kingdom/,
      ),
    ).toBeVisible();

    const cookies = await context.cookies();
    expect(cookies.find((c) => c.name === "region")?.value).toBe("GB");

    // The choice sticks across pages and drives the release calendar.
    await page.goto("/upcoming");
    await expect(page.getByText(/in United Kingdom/)).toBeVisible();
  });
});
