import "server-only";
import type { z } from "zod";
import { env } from "@/env";
import {
  genreListSchema,
  movieDetailsSchema,
  pagedMoviesSchema,
  personExternalIdsSchema,
  regionsSchema,
  releaseDatesSchema,
} from "./schemas";

const BASE_URL = "https://api.themoviedb.org/3";

export class TmdbError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
    this.name = "TmdbError";
  }
}

type Params = Record<string, string | number | undefined>;

async function tmdbFetch<T extends z.ZodType>(
  path: string,
  schema: T,
  params: Params = {},
  /** Seconds Next.js may cache the response for. */
  revalidate = 60 * 60,
): Promise<z.infer<T>> {
  const url = new URL(BASE_URL + path);
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined) url.searchParams.set(key, String(value));
  }

  const res = await fetch(url, {
    headers: {
      accept: "application/json",
      Authorization: `Bearer ${env.TMDB_ACCESS_TOKEN}`,
    },
    next: { revalidate },
  });
  if (!res.ok) {
    throw new TmdbError(`TMDB ${path} failed with ${res.status}`, res.status);
  }
  return schema.parse(await res.json());
}

export const tmdb = {
  trending(window: "day" | "week", page = 1) {
    // Trending changes through the day; keep it fresh-ish.
    return tmdbFetch(
      `/trending/movie/${window}`,
      pagedMoviesSchema,
      { page },
      60 * 15,
    );
  },

  popular(page = 1) {
    return tmdbFetch("/movie/popular", pagedMoviesSchema, { page }, 60 * 30);
  },

  /** Most popular movies in a genre. */
  byGenre(genreId: number, page = 1) {
    return tmdbFetch(
      "/discover/movie",
      pagedMoviesSchema,
      {
        with_genres: genreId,
        sort_by: "popularity.desc",
        include_adult: "false",
        page,
      },
      60 * 30,
    );
  },

  /**
   * Movies with a public release (theatrical or digital) in `region` between
   * [from, to] (YYYY-MM-DD), most anticipated first. Note that each result's
   * `release_date` is still its worldwide premiere; use `releaseDates` for
   * the regional day.
   */
  releasingInRegion(region: string, from: string, to: string, page = 1) {
    return tmdbFetch(
      "/discover/movie",
      pagedMoviesSchema,
      {
        region,
        "release_date.gte": from,
        "release_date.lte": to,
        with_release_type: "2|3|4",
        sort_by: "popularity.desc",
        include_adult: "false",
        page,
      },
      60 * 60,
    );
  },

  /** Every country's release dates for a movie. */
  releaseDates(id: number) {
    return tmdbFetch(
      `/movie/${id}/release_dates`,
      releaseDatesSchema,
      {},
      60 * 60 * 24,
    );
  },

  /** Countries TMDB has watch-provider data for. */
  regions() {
    return tmdbFetch(
      "/watch/providers/regions",
      regionsSchema,
      {},
      60 * 60 * 24 * 7,
    );
  },

  movie(id: number) {
    return tmdbFetch(`/movie/${id}`, movieDetailsSchema, {
      append_to_response: "credits,videos,recommendations,watch/providers",
    });
  },

  search(query: string, page = 1) {
    return tmdbFetch(
      "/search/movie",
      pagedMoviesSchema,
      { query, page, include_adult: "false" },
      60 * 5,
    );
  },

  personExternalIds(id: number) {
    // External IDs almost never change; cache for a week.
    return tmdbFetch(
      `/person/${id}/external_ids`,
      personExternalIdsSchema,
      {},
      60 * 60 * 24 * 7,
    );
  },

  genres() {
    return tmdbFetch("/genre/movie/list", genreListSchema, {}, 60 * 60 * 24);
  },
};
