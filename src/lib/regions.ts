/**
 * The viewer's region (an ISO 3166-1 country code) drives "where to watch"
 * and the release calendar. It's stored in a cookie so the server can read it
 * while rendering.
 */

export const REGION_COOKIE = "region";
export const DEFAULT_REGION = "US";
/** One year, in seconds. */
export const REGION_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

const CODE = /^[A-Z]{2}$/;

export function isRegionCode(value: unknown): value is string {
  return typeof value === "string" && CODE.test(value);
}

/**
 * Picks the region to use: the viewer's saved choice, else the country their
 * request comes from (Vercel's geo header), else the US.
 */
export function resolveRegion({
  cookie,
  ipCountry,
}: {
  cookie?: string | null;
  ipCountry?: string | null;
}) {
  const saved = cookie?.toUpperCase();
  if (isRegionCode(saved)) return saved;
  const detected = ipCountry?.toUpperCase();
  if (isRegionCode(detected)) return detected;
  return DEFAULT_REGION;
}

/** Reads one cookie from a raw `Cookie` header. */
export function readCookie(header: string | null | undefined, name: string) {
  if (!header) return null;
  for (const part of header.split(";")) {
    const [key, ...rest] = part.trim().split("=");
    if (key === name) return decodeURIComponent(rest.join("="));
  }
  return null;
}

/** "GB" → "🇬🇧" (regional indicator symbols). */
export function flagEmoji(code: string) {
  if (!isRegionCode(code)) return "🏳️";
  return String.fromCodePoint(
    ...[...code].map((c) => 0x1f1e6 + c.charCodeAt(0) - 65),
  );
}
