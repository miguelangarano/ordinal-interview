import { expect, test } from "@playwright/test";

test.describe("region", () => {
  test("picking a region updates where-to-watch and the calendar", async ({
    page,
    context,
  }) => {
    await page.goto("/movie/693134"); // Dune: Part Two
    const picker = page.getByRole("button", { name: /^Region:/ });
    // The default depends on where the request comes from (US locally, the
    // visitor's country on Vercel), so switch to whichever isn't selected.
    const target = (await picker.textContent())?.includes("GB")
      ? { code: "JP", name: "Japan" }
      : { code: "GB", name: "United Kingdom" };

    await picker.click();
    await page
      .getByRole("menuitemradio", { name: new RegExp(target.name) })
      .click();

    await expect(picker).toContainText(target.code);
    await expect(
      page.getByText(new RegExp(`(Availability|options) in ${target.name}`)),
    ).toBeVisible();

    const cookies = await context.cookies();
    expect(cookies.find((c) => c.name === "region")?.value).toBe(target.code);

    // The choice sticks across pages and drives the release calendar.
    await page.goto("/upcoming");
    // First visit for this region looks up local release dates: allow time.
    await expect(page.getByText(`in ${target.name}`)).toBeVisible({
      timeout: 20_000,
    });
  });
});
