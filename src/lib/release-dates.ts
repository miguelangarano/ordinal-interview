/**
 * TMDB release date types:
 * 1 Premiere · 2 Theatrical (limited) · 3 Theatrical · 4 Digital
 * 5 Physical · 6 TV
 */
const PUBLIC_RELEASE_TYPES = new Set([2, 3, 4]);

export type RegionReleaseDates = {
  iso_3166_1: string;
  release_dates: { release_date: string; type: number }[];
};

/**
 * The day (YYYY-MM-DD) a movie comes out in `region` within [from, to].
 *
 * TMDB's discover endpoint can filter by regional release dates but still
 * returns each movie's worldwide premiere date, so the calendar resolves the
 * real local date here. Public releases (theatrical or digital) win over
 * premieres and TV/physical releases. Returns null when nothing in the
 * region falls inside the range.
 */
export function regionalReleaseDate(
  results: RegionReleaseDates[],
  region: string,
  from: string,
  to: string,
): string | null {
  const dates =
    results.find((r) => r.iso_3166_1 === region)?.release_dates ?? [];

  const inRange = dates
    .map((d) => ({ day: d.release_date.slice(0, 10), type: d.type }))
    .filter((d) => d.day >= from && d.day <= to)
    .sort((a, b) => a.day.localeCompare(b.day));

  return (
    inRange.find((d) => PUBLIC_RELEASE_TYPES.has(d.type))?.day ??
    inRange[0]?.day ??
    null
  );
}
