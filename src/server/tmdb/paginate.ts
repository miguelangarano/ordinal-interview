import "server-only";
import type { MovieSummary, PagedMovies } from "./schemas";

/** TMDB always returns 20 results per page and never serves past page 500. */
const TMDB_PAGE_SIZE = 20;
const TMDB_MAX_PAGE = 500;

export type MovieWindow = {
  results: MovieSummary[];
  totalResults: number;
  /** Offset of the next window, or undefined when there's nothing left. */
  nextCursor: number | undefined;
};

/**
 * Serves an arbitrary [offset, offset + limit) window over a TMDB list,
 * stitching together however many 20-item TMDB pages that spans. This lets
 * the UI ask for "10 more" (carousels) or "50 more" (grids) regardless of
 * TMDB's fixed page size.
 */
export async function movieWindow(
  fetchPage: (page: number) => Promise<PagedMovies>,
  offset: number,
  limit: number,
): Promise<MovieWindow> {
  const firstPage = Math.floor(offset / TMDB_PAGE_SIZE) + 1;
  const lastPage = Math.min(
    Math.floor((offset + limit - 1) / TMDB_PAGE_SIZE) + 1,
    TMDB_MAX_PAGE,
  );

  // Fetch the first page alone so we know how many pages actually exist.
  const first = await fetchPage(firstPage);
  const available = Math.min(first.total_pages, TMDB_MAX_PAGE);
  const rest = await Promise.all(
    range(firstPage + 1, Math.min(lastPage, available)).map(fetchPage),
  );

  // TMDB rankings can shift between page requests; drop repeats.
  const seen = new Set<number>();
  const all = [first, ...rest]
    .flatMap((p) => p.results)
    .filter((m) => !seen.has(m.id) && seen.add(m.id));

  const start = offset - (firstPage - 1) * TMDB_PAGE_SIZE;
  const results = all.slice(start, start + limit);

  const reachable = Math.min(
    first.total_results,
    available * TMDB_PAGE_SIZE,
  );
  const next = offset + limit;

  return {
    results,
    totalResults: first.total_results,
    nextCursor: next < reachable && results.length > 0 ? next : undefined,
  };
}

function range(from: number, to: number) {
  return Array.from({ length: Math.max(0, to - from + 1) }, (_, i) => from + i);
}
