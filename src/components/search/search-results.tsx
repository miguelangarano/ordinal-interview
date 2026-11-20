"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { LoadMore } from "@/components/load-more";
import { MovieCard, MovieCardSkeleton } from "@/components/movie-card";
import { MovieGrid } from "@/components/movie-grid";
import { useTRPC } from "@/trpc/react";

export function SearchResults({ query }: { query: string }) {
  const trpc = useTRPC();
  const search = useInfiniteQuery(
    trpc.movies.search.infiniteQueryOptions(
      { query },
      { getNextPageParam: (last) => last.nextCursor },
    ),
  );

  const movies = useMemo(() => {
    const seen = new Set<number>();
    return (search.data?.pages ?? [])
      .flatMap((p) => p.results)
      .filter((m) => !seen.has(m.id) && seen.add(m.id));
  }, [search.data]);

  const total = search.data?.pages[0]?.totalResults ?? 0;

  return (
    <>
      <p className="mb-6 text-sm text-muted-foreground" aria-live="polite">
        {search.isPending
          ? "Searching…"
          : `${total.toLocaleString("en-US")} ${total === 1 ? "result" : "results"} for “${query}”`}
      </p>

      {search.isError ? (
        <p className="rounded-lg border border-destructive/40 bg-destructive/10 p-6 text-sm">
          Search failed.{" "}
          <button
            className="underline underline-offset-4"
            onClick={() => search.refetch()}
          >
            Try again
          </button>
        </p>
      ) : search.isPending ? (
        <MovieGrid>
          {Array.from({ length: 12 }, (_, i) => (
            <MovieCardSkeleton key={i} />
          ))}
        </MovieGrid>
      ) : movies.length === 0 ? (
        <p className="py-16 text-center text-muted-foreground">
          No movies match that search. Try a different title.
        </p>
      ) : (
        <MovieGrid>
          {movies.map((movie) => (
            <MovieCard key={movie.id} movie={movie} />
          ))}
        </MovieGrid>
      )}

      <LoadMore
        hasNextPage={!!search.hasNextPage}
        isFetching={search.isFetchingNextPage}
        onLoadMore={() => void search.fetchNextPage()}
      />
    </>
  );
}
