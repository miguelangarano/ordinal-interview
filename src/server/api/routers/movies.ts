import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { tmdb } from "@/server/tmdb/client";
import { englishWikipediaUrls } from "@/server/wikipedia";

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

  /**
   * English Wikipedia URLs for a set of TMDB people, keyed by person id.
   * Best-effort: people without a Wikidata entry or an English article are
   * left out, and a failed lookup for one person never fails the rest.
   */
  castWikipedia: publicProcedure
    .input(
      z.object({
        personIds: z.array(z.number().int().positive()).max(20),
      }),
    )
    .query(async ({ input }) => {
      const externalIds = await Promise.allSettled(
        input.personIds.map((id) => tmdb.personExternalIds(id)),
      );
      const qidByPerson = new Map<number, string>();
      for (const result of externalIds) {
        if (result.status === "fulfilled" && result.value.wikidata_id) {
          qidByPerson.set(result.value.id, result.value.wikidata_id);
        }
      }

      const urlByQid = await englishWikipediaUrls([...qidByPerson.values()]);

      const urls: Record<number, string> = {};
      for (const [personId, qid] of qidByPerson) {
        const url = urlByQid[qid];
        if (url) urls[personId] = url;
      }
      return urls;
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
