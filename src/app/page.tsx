import { Hero } from "@/components/home/hero";
import { MovieCarousel } from "@/components/movie-carousel";
import { CAROUSEL_BATCH } from "@/lib/batch-sizes";
import { api, getQueryClient, HydrateClient, trpc } from "@/trpc/server";

const nextCursor = (last: { nextCursor?: number }) => last.nextCursor;

export default async function Home() {
  const queryClient = getQueryClient();

  // The first two rows render on the server (no loading flash above the
  // fold); the category rows below load on the client.
  const [trending, genres, topGenres] = await Promise.all([
    queryClient.fetchInfiniteQuery(
      trpc.movies.list.infiniteQueryOptions(
        { source: { kind: "trending" }, limit: CAROUSEL_BATCH },
        { getNextPageParam: nextCursor },
      ),
    ),
    api.movies.genres(),
    api.movies.topGenres().catch(() => ({ top: [], rest: [] })),
    queryClient.prefetchInfiniteQuery(
      trpc.movies.list.infiniteQueryOptions(
        { source: { kind: "popular" }, limit: CAROUSEL_BATCH },
        { getNextPageParam: nextCursor },
      ),
    ),
  ]);

  const top = trending.pages[0]?.results[0];

  return (
    <HydrateClient>
      {top && <Hero movie={top} genres={genres} />}
      <div className="mx-auto max-w-7xl px-4 pt-6 sm:px-6">
        <MovieCarousel
          title="Trending today"
          subtitle="What everyone is watching right now."
          source={{ kind: "trending" }}
          ranked
        />
        <MovieCarousel
          title="Popular"
          subtitle="The most popular movies on TMDB."
          source={{ kind: "popular" }}
        />
        {topGenres.top.map((genre) => (
          <MovieCarousel
            key={genre.id}
            title={genre.name}
            source={{ kind: "genre", genreId: genre.id }}
            href={`/category/${genre.id}`}
          />
        ))}
      </div>
    </HydrateClient>
  );
}
