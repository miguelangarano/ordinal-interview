import { describe, expect, it } from "vitest";
import { regionalReleaseDate, type RegionReleaseDates } from "./release-dates";

const at = (date: string, type: number) => ({
  release_date: `${date}T00:00:00.000Z`,
  type,
});

const dates: RegionReleaseDates[] = [
  { iso_3166_1: "US", release_dates: [at("2026-10-16", 3)] },
  {
    iso_3166_1: "GB",
    release_dates: [
      at("2026-11-20", 1), // premiere
      at("2026-12-04", 3), // theatrical
      at("2027-03-01", 4), // digital, next year
    ],
  },
];

describe("regionalReleaseDate", () => {
  it("uses the region's own date, not the worldwide one", () => {
    expect(regionalReleaseDate(dates, "GB", "2026-12-01", "2026-12-31")).toBe(
      "2026-12-04",
    );
    expect(regionalReleaseDate(dates, "US", "2026-10-01", "2026-10-31")).toBe(
      "2026-10-16",
    );
  });

  it("prefers public releases over premieres in the same range", () => {
    expect(regionalReleaseDate(dates, "GB", "2026-11-01", "2026-12-31")).toBe(
      "2026-12-04",
    );
  });

  it("falls back to other release types when that's all there is", () => {
    expect(regionalReleaseDate(dates, "GB", "2026-11-01", "2026-11-30")).toBe(
      "2026-11-20",
    );
  });

  it("returns null outside the range or for unknown regions", () => {
    expect(
      regionalReleaseDate(dates, "GB", "2026-01-01", "2026-01-31"),
    ).toBeNull();
    expect(
      regionalReleaseDate(dates, "FR", "2026-12-01", "2026-12-31"),
    ).toBeNull();
  });
});
