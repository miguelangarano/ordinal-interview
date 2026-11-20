const IMAGE_BASE = "https://image.tmdb.org/t/p";

type PosterSize = "w185" | "w342" | "w500" | "w780";
type BackdropSize = "w780" | "w1280" | "original";
type ProfileSize = "w185" | "h632";
type LogoSize = "w45" | "w92";

export function tmdbImage(
  path: string | null | undefined,
  size: PosterSize | BackdropSize | ProfileSize | LogoSize,
) {
  return path ? `${IMAGE_BASE}/${size}${path}` : null;
}

export function releaseYear(date: string) {
  return date ? date.slice(0, 4) : null;
}

export function formatRuntime(minutes: number | null) {
  if (!minutes) return null;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return h ? `${h}h ${m}m` : `${m}m`;
}
