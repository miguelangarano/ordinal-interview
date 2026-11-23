import { describe, expect, it } from "vitest";
import { providerUrl } from "./provider-links";

const FALLBACK = "https://www.themoviedb.org/movie/1/watch";

describe("providerUrl", () => {
  it.each([
    ["Netflix", "https://www.netflix.com"],
    ["Amazon Prime Video", "https://www.primevideo.com"],
    ["Amazon Prime Video with Ads", "https://www.primevideo.com"],
    ["Amazon Video", "https://www.primevideo.com"],
    ["Apple TV Store", "https://tv.apple.com"],
    ["Google Play Movies", "https://play.google.com/store/movies"],
    ["Fandango At Home", "https://athome.fandango.com"],
    ["HBO Max", "https://www.max.com"],
    ["History Vault", "https://www.historyvault.com"],
  ])("links %s to its own site", (name, url) => {
    expect(providerUrl(name, FALLBACK)).toBe(url);
  });

  it("falls back to the movie's watch page for unknown services", () => {
    expect(providerUrl("Some Local Streamer", FALLBACK)).toBe(FALLBACK);
  });

  it("returns null when there's nothing to link to", () => {
    expect(providerUrl("Some Local Streamer", null)).toBeNull();
  });
});
