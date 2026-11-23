import { describe, expect, it } from "vitest";
import { formatRuntime, releaseYear, tmdbImage } from "./tmdb-image";

describe("tmdbImage", () => {
  it("builds a sized CDN URL", () => {
    expect(tmdbImage("/abc.jpg", "w342")).toBe(
      "https://image.tmdb.org/t/p/w342/abc.jpg",
    );
  });

  it("returns null for missing images", () => {
    expect(tmdbImage(null, "w342")).toBeNull();
    expect(tmdbImage(undefined, "w185")).toBeNull();
  });
});

describe("formatting", () => {
  it("formats runtimes", () => {
    expect(formatRuntime(167)).toBe("2h 47m");
    expect(formatRuntime(45)).toBe("45m");
    expect(formatRuntime(120)).toBe("2h 0m");
    expect(formatRuntime(null)).toBeNull();
    expect(formatRuntime(0)).toBeNull();
  });

  it("extracts the release year", () => {
    expect(releaseYear("2024-02-27")).toBe("2024");
    expect(releaseYear("")).toBeNull();
  });
});
