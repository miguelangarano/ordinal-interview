import { Hero } from "@/components/home/hero";
import { TrendingSection } from "@/components/home/trending-section";
import { api, getQueryClient, HydrateClient, trpc } from "@/trpc/server";

export default async function Home() {
  // Fetch page 1 of today's trending once on the server: it powers the hero
  // and is handed to the client grid via hydration (no loading flash).
  const [trending, genres] = await Promise.all([
    getQueryClient().fetchInfiniteQuery(
      trpc.movies.trending.infiniteQueryOptions(
        { window: "day" },
        { getNextPageParam: (last) => last.nextCursor },
      ),
    ),
    api.movies.genres(),
  ]);

  const top = trending.pages[0]?.results[0];

  return (
    <HydrateClient>
      {top && <Hero movie={top} genres={genres} />}
      <TrendingSection />
    </HydrateClient>
  );
}
