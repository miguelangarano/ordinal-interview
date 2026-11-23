import { z } from "zod";

/** A movie as it appears in list endpoints (trending, search, recommendations). */
export const movieSummarySchema = z.object({
  id: z.number(),
  title: z.string(),
  overview: z.string().default(""),
  poster_path: z.string().nullable().default(null),
  backdrop_path: z.string().nullable().default(null),
  release_date: z.string().default(""),
  vote_average: z.number().default(0),
  vote_count: z.number().default(0),
  genre_ids: z.array(z.number()).default([]),
});
export type MovieSummary = z.infer<typeof movieSummarySchema>;

export const pagedMoviesSchema = z.object({
  page: z.number(),
  total_pages: z.number(),
  total_results: z.number(),
  results: z.array(movieSummarySchema),
});
export type PagedMovies = z.infer<typeof pagedMoviesSchema>;

const castMemberSchema = z.object({
  id: z.number(),
  name: z.string(),
  character: z.string().default(""),
  profile_path: z.string().nullable().default(null),
  order: z.number().default(0),
});

const crewMemberSchema = z.object({
  id: z.number(),
  name: z.string(),
  job: z.string(),
  department: z.string().default(""),
});

const videoSchema = z.object({
  key: z.string(),
  name: z.string(),
  site: z.string(),
  type: z.string(),
  official: z.boolean().default(false),
});

const providerSchema = z.object({
  provider_id: z.number(),
  provider_name: z.string(),
  logo_path: z.string().nullable().default(null),
});

const watchRegionSchema = z.object({
  link: z.string().optional(),
  flatrate: z.array(providerSchema).optional(),
  rent: z.array(providerSchema).optional(),
  buy: z.array(providerSchema).optional(),
});

export const movieDetailsSchema = z.object({
  id: z.number(),
  title: z.string(),
  original_title: z.string().default(""),
  tagline: z.string().nullable().default(null),
  overview: z.string().default(""),
  poster_path: z.string().nullable().default(null),
  backdrop_path: z.string().nullable().default(null),
  release_date: z.string().default(""),
  runtime: z.number().nullable().default(null),
  vote_average: z.number().default(0),
  vote_count: z.number().default(0),
  status: z.string().default(""),
  budget: z.number().default(0),
  revenue: z.number().default(0),
  homepage: z.string().nullable().default(null),
  imdb_id: z.string().nullable().default(null),
  genres: z.array(z.object({ id: z.number(), name: z.string() })).default([]),
  credits: z
    .object({
      cast: z.array(castMemberSchema).default([]),
      crew: z.array(crewMemberSchema).default([]),
    })
    .default({ cast: [], crew: [] }),
  videos: z
    .object({ results: z.array(videoSchema).default([]) })
    .default({ results: [] }),
  recommendations: pagedMoviesSchema.optional(),
  "watch/providers": z
    .object({ results: z.record(z.string(), watchRegionSchema).default({}) })
    .default({ results: {} }),
});
export type MovieDetailsResponse = z.infer<typeof movieDetailsSchema>;

export const genreListSchema = z.object({
  genres: z.array(z.object({ id: z.number(), name: z.string() })),
});

export const personExternalIdsSchema = z.object({
  id: z.number(),
  wikidata_id: z.string().nullable().default(null),
});

export const regionsSchema = z.object({
  results: z.array(
    z.object({ iso_3166_1: z.string(), english_name: z.string() }),
  ),
});

export const releaseDatesSchema = z.object({
  id: z.number(),
  results: z
    .array(
      z.object({
        iso_3166_1: z.string(),
        release_dates: z.array(
          z.object({ release_date: z.string(), type: z.number() }),
        ),
      }),
    )
    .default([]),
});
