import { describe, expect, it } from "vitest";
import {
  DEFAULT_REGION,
  flagEmoji,
  isRegionCode,
  readCookie,
  regionName,
  resolveRegion,
} from "./regions";

describe("resolveRegion", () => {
  it("prefers the viewer's saved choice", () => {
    expect(resolveRegion({ cookie: "GB", ipCountry: "MX" })).toBe("GB");
  });

  it("falls back to the request's country", () => {
    expect(resolveRegion({ cookie: null, ipCountry: "MX" })).toBe("MX");
  });

  it("defaults to the US", () => {
    expect(resolveRegion({})).toBe(DEFAULT_REGION);
    expect(DEFAULT_REGION).toBe("US");
  });

  it("ignores malformed values and normalises case", () => {
    expect(resolveRegion({ cookie: "<script>", ipCountry: "xx1" })).toBe("US");
    expect(resolveRegion({ cookie: "gb" })).toBe("GB");
  });
});

describe("readCookie", () => {
  it("finds one cookie in a Cookie header", () => {
    expect(readCookie("a=1; region=GB; b=2", "region")).toBe("GB");
  });

  it("returns null when it's missing", () => {
    expect(readCookie("a=1", "region")).toBeNull();
    expect(readCookie(null, "region")).toBeNull();
  });

  it("doesn't match cookies that only share a prefix", () => {
    expect(readCookie("myregion=FR; region=DE", "region")).toBe("DE");
  });
});

describe("region display", () => {
  it("validates two-letter codes", () => {
    expect(isRegionCode("US")).toBe(true);
    expect(isRegionCode("us")).toBe(false);
    expect(isRegionCode("USA")).toBe(false);
  });

  it("turns codes into flags", () => {
    expect(flagEmoji("GB")).toBe("🇬🇧");
    expect(flagEmoji("MX")).toBe("🇲🇽");
  });

  it("turns codes into country names", () => {
    expect(regionName("GB")).toBe("United Kingdom");
    expect(regionName("MX")).toBe("Mexico");
  });
});
