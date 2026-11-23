import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { tmdb } from "@/server/tmdb/client";
import { movieWindow } from "@/server/tmdb/paginate";
import { englishWikipediaUrls } from "@/server/wikipedia";

/** Every list of movies the UI can show, as one discriminated input. */
const listSource = z.discriminatedUnion("kind", [
  z.object({ kind: z.literal("trending") }),
  z.object({ kind: z.literal("popular") }),
  z.object({ kind: z.literal("genre"), genreId: z.number().int().positive() }),
  z.object({ kind: z.literal("search"), query: z.string().trim().min(1) }),
]);
export type ListSource = z.infer<typeof listSource>;

function pageFetcher(source: ListSource) {
  switch (source.kind) {
    case "trending":
      return (page: number) => tmdb.trending("day", page);
    case "popular":
      return (page: number) => tmdb.popular(page);
    case "genre":
      return (page: number) => tmdb.byGenre(source.genreId, page);
    case "search":
      return (page: number) => tmdb.search(source.query, page);
  }
}

const MONTH = /^\d{4}-(0[1-9]|1[0-2])$/;

export const moviesRouter = createTRPCRouter({
  /**
   * A window of any movie list. `cursor` is an offset, so carousels can ask
   * for 10 at a time and grids for 50, independent of TMDB's page size.
   */
  list: publicProcedure
    .input(
      z.object({
        source: listSource,
        limit: z.number().int().min(1).max(60).default(20),
        cursor: z.number().int().min(0).max(10_000).default(0),
      }),
    )
    .query(({ input }) =>
      movieWindow(pageFetcher(input.source), input.cursor, input.limit),
    ),

  /**
   * All genres, split into the five most common in this week's trending
   * movies (what people are watching now) and the rest alphabetically.
   */
  topGenres: publicProcedure.query(async () => {
    const [{ genres }, trending] = await Promise.all([
      tmdb.genres(),
      movieWindow((page) => tmdb.trending("week", page), 0, 60).catch(
        () => null,
      ),
    ]);

    const counts = new Map<number, number>();
    for (const movie of trending?.results ?? []) {
      for (const id of movie.genre_ids) {
        counts.set(id, (counts.get(id) ?? 0) + 1);
      }
    }

    const ranked = [...genres].sort(
      (a, b) =>
        (counts.get(b.id) ?? 0) - (counts.get(a.id) ?? 0) ||
        a.name.localeCompare(b.name),
    );
    return {
      top: ranked.slice(0, 5),
      rest: ranked.slice(5).sort((a, b) => a.name.localeCompare(b.name)),
    };
  }),

  /**
   * The most anticipated movies releasing in a month ("YYYY-MM"), for the
   * calendar. Capped at the 100 most popular so busy months stay usable.
   */
  upcoming: publicProcedure
    .input(z.object({ month: z.string().regex(MONTH) }))
    .query(async ({ input }) => {
      const [year, month] = input.month.split("-").map(Number) as [
        number,
        number,
      ];
      const lastDay = new Date(Date.UTC(year, month, 0)).getUTCDate();
      const from = `${input.month}-01`;
      const to = `${input.month}-${String(lastDay).padStart(2, "0")}`;

      const { results } = await movieWindow(
        (page) => tmdb.releasingBetween(from, to, page),
        0,
        100,
      );
      return results.filter(
        (m) => m.poster_path && m.release_date >= from && m.release_date <= to,
      );
    }),

  // Legacy page-based endpoints; removed once the UI moves to `list`.
  trending: publicProcedure
    .input(
      z.object({
        window: z.enum(["day", "week"]).default("day"),
        cursor: z.number().int().min(1).max(500).default(1),
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
    .input(
      z.object({
        query: z.string().trim().min(1),
        cursor: z.number().int().min(1).max(500).default(1),
      }),
    )
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
