import "server-only";
import type { z } from "zod";
import { env } from "@/env";
import {
  genreListSchema,
  movieDetailsSchema,
  pagedMoviesSchema,
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

  const headers: HeadersInit = { accept: "application/json" };
  if (env.TMDB_ACCESS_TOKEN) {
    headers.Authorization = `Bearer ${env.TMDB_ACCESS_TOKEN}`;
  } else if (env.TMDB_API_KEY) {
    url.searchParams.set("api_key", env.TMDB_API_KEY);
  }

  const res = await fetch(url, { headers, next: { revalidate } });
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

  genres() {
    return tmdbFetch("/genre/movie/list", genreListSchema, {}, 60 * 60 * 24);
  },
};
