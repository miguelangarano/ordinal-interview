import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { tmdb } from "@/server/tmdb/client";

const pageInput = z.number().int().min(1).max(500).default(1);

export const moviesRouter = createTRPCRouter({
  trending: publicProcedure
    .input(
      z.object({
        window: z.enum(["day", "week"]).default("day"),
        cursor: pageInput,
      }),
    )
    .query(async ({ input }) => {
      const data = await tmdb.trending(input.window, input.cursor);
      return {
        results: data.results,
        nextCursor: data.page < data.total_pages ? data.page + 1 : undefined,
      };
    }),

  search: publicProcedure
    .input(z.object({ query: z.string().trim().min(1), cursor: pageInput }))
    .query(async ({ input }) => {
      const data = await tmdb.search(input.query, input.cursor);
      return {
        results: data.results,
        totalResults: data.total_results,
        nextCursor: data.page < data.total_pages ? data.page + 1 : undefined,
      };
    }),

  genres: publicProcedure.query(async () => {
    const { genres } = await tmdb.genres();
    return Object.fromEntries(genres.map((g) => [g.id, g.name])) as Record<
      number,
      string
    >;
  }),

  byId: publicProcedure
    .input(z.object({ id: z.number().int().positive() }))
    .query(async ({ input }) => {
      const m = await tmdb.movie(input.id);

      const trailer =
        m.videos.results.find(
          (v) => v.site === "YouTube" && v.type === "Trailer" && v.official,
        ) ??
        m.videos.results.find(
          (v) => v.site === "YouTube" && v.type === "Trailer",
        ) ??
        m.videos.results.find((v) => v.site === "YouTube");

      const directors = m.credits.crew
        .filter((c) => c.job === "Director")
        .map((c) => c.name);
      const writers = [
        ...new Set(
          m.credits.crew
            .filter((c) => c.department === "Writing")
            .map((c) => c.name),
        ),
      ].slice(0, 3);

      const providers = m["watch/providers"].results.US;

      return {
        id: m.id,
        title: m.title,
        originalTitle: m.original_title,
        tagline: m.tagline,
        overview: m.overview,
        posterPath: m.poster_path,
        backdropPath: m.backdrop_path,
        releaseDate: m.release_date,
        runtime: m.runtime,
        voteAverage: m.vote_average,
        voteCount: m.vote_count,
        status: m.status,
        budget: m.budget,
        revenue: m.revenue,
        homepage: m.homepage,
        imdbId: m.imdb_id,
        genres: m.genres,
        directors,
        writers,
        cast: m.credits.cast
          .sort((a, b) => a.order - b.order)
          .slice(0, 15),
        trailerKey: trailer?.key ?? null,
        watch: providers
          ? {
              link: providers.link ?? null,
              stream: providers.flatrate ?? [],
              rent: providers.rent ?? [],
              buy: providers.buy ?? [],
            }
          : null,
        recommendations: (m.recommendations?.results ?? []).slice(0, 12),
      };
    }),
});
