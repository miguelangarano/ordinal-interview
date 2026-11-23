import { describe, expect, it, vi } from "vitest";
import { movieWindow } from "./paginate";
import type { MovieSummary, PagedMovies } from "./schemas";

const movie = (id: number): MovieSummary => ({
  id,
  title: `Movie ${id}`,
  overview: "",
  poster_path: null,
  backdrop_path: null,
  release_date: "",
  vote_average: 0,
  vote_count: 0,
  genre_ids: [],
});

/**
 * A fake TMDB list of `total` movies with ids 1..total, served 20 per page
 * like the real API.
 */
function fakeList(total: number) {
  const totalPages = Math.ceil(total / 20);
  return vi.fn(async (page: number): Promise<PagedMovies> => {
    const start = (page - 1) * 20;
    const ids = Array.from(
      { length: Math.max(0, Math.min(20, total - start)) },
      (_, i) => start + i + 1,
    );
    return {
      page,
      total_pages: totalPages,
      total_results: total,
      results: ids.map(movie),
    };
  });
}

const ids = (w: { results: MovieSummary[] }) => w.results.map((m) => m.id);

describe("movieWindow", () => {
  it("serves the first 10 from a single TMDB page", async () => {
    const fetchPage = fakeList(100);
    const window = await movieWindow(fetchPage, 0, 10);

    expect(ids(window)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    expect(window.nextCursor).toBe(10);
    expect(window.totalResults).toBe(100);
    expect(fetchPage).toHaveBeenCalledTimes(1);
  });

  it("serves the second 10 from the same TMDB page", async () => {
    const fetchPage = fakeList(100);
    const window = await movieWindow(fetchPage, 10, 10);

    expect(ids(window)).toEqual([11, 12, 13, 14, 15, 16, 17, 18, 19, 20]);
    expect(fetchPage).toHaveBeenCalledWith(1);
    expect(fetchPage).toHaveBeenCalledTimes(1);
  });

  it("stitches a window that spans two TMDB pages", async () => {
    const fetchPage = fakeList(100);
    const window = await movieWindow(fetchPage, 15, 10);

    expect(ids(window)).toEqual([16, 17, 18, 19, 20, 21, 22, 23, 24, 25]);
    expect(fetchPage.mock.calls.map(([p]) => p)).toEqual([1, 2]);
  });

  it("serves a grid batch of 50 across three pages", async () => {
    const fetchPage = fakeList(1000);
    const window = await movieWindow(fetchPage, 50, 50);

    expect(window.results).toHaveLength(50);
    expect(window.results[0]?.id).toBe(51);
    expect(window.results.at(-1)?.id).toBe(100);
    expect(fetchPage.mock.calls.map(([p]) => p)).toEqual([3, 4, 5]);
    expect(window.nextCursor).toBe(100);
  });

  it("stops at the end of the list", async () => {
    const window = await movieWindow(fakeList(25), 20, 10);

    expect(ids(window)).toEqual([21, 22, 23, 24, 25]);
    expect(window.nextCursor).toBeUndefined();
  });

  it("doesn't request pages past the last one", async () => {
    const fetchPage = fakeList(30); // 2 pages
    await movieWindow(fetchPage, 0, 60);

    expect(fetchPage.mock.calls.map(([p]) => p)).toEqual([1, 2]);
  });

  it("handles an empty list", async () => {
    const window = await movieWindow(fakeList(0), 0, 10);

    expect(window.results).toEqual([]);
    expect(window.nextCursor).toBeUndefined();
  });

  it("drops a movie repeated across pages", async () => {
    const fetchPage = vi.fn(async (page: number): Promise<PagedMovies> => ({
      page,
      total_pages: 2,
      total_results: 40,
      // Rankings shifted between requests: movie 20 shows up on both pages.
      results:
        page === 1
          ? Array.from({ length: 20 }, (_, i) => movie(i + 1))
          : [movie(20), ...Array.from({ length: 19 }, (_, i) => movie(i + 21))],
    }));
    const window = await movieWindow(fetchPage, 0, 40);

    expect(new Set(ids(window)).size).toBe(window.results.length);
    expect(ids(window).filter((id) => id === 20)).toHaveLength(1);
  });

  it("never goes past TMDB's 500-page limit", async () => {
    const fetchPage = fakeList(1_000_000);
    const window = await movieWindow(fetchPage, 9_990, 10);

    expect(ids(window)[0]).toBe(9_991);
    expect(window.nextCursor).toBeUndefined();
  });
});
