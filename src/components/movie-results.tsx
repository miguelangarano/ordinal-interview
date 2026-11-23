"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { LoadMore } from "@/components/load-more";
import { MovieCard, MovieCardSkeleton } from "@/components/movie-card";
import { MovieGrid } from "@/components/movie-grid";
import { RESULTS_BATCH } from "@/lib/batch-sizes";
import type { ListSource } from "@/server/api/routers/movies";
import { useTRPC } from "@/trpc/react";

export function MovieResults({
  source,
  describe,
  emptyMessage,
}: {
  source: ListSource;
  /** Summary line, e.g. `1,133 results for "dune"`. */
  describe: (total: number) => string;
  emptyMessage: string;
}) {
  const trpc = useTRPC();
  const query = useInfiniteQuery(
    trpc.movies.list.infiniteQueryOptions(
      { source, limit: RESULTS_BATCH },
      { getNextPageParam: (last) => last.nextCursor },
    ),
  );

  const movies = useMemo(() => {
    const seen = new Set<number>();
    return (query.data?.pages ?? [])
      .flatMap((p) => p.results)
      .filter((m) => !seen.has(m.id) && seen.add(m.id));
  }, [query.data]);

  const total = query.data?.pages[0]?.totalResults ?? 0;

  return (
    <>
      <p className="mb-6 text-sm text-muted-foreground" aria-live="polite">
        {query.isPending ? "Loading…" : describe(total)}
      </p>

      {query.isError ? (
        <p className="rounded-lg border border-destructive/40 bg-destructive/10 p-6 text-sm">
          Couldn&apos;t load movies.{" "}
          <button
            className="underline underline-offset-4"
            onClick={() => query.refetch()}
          >
            Try again
          </button>
        </p>
      ) : query.isPending ? (
        <MovieGrid>
          {Array.from({ length: 18 }, (_, i) => (
            <MovieCardSkeleton key={i} />
          ))}
        </MovieGrid>
      ) : movies.length === 0 ? (
        <p className="py-16 text-center text-muted-foreground">
          {emptyMessage}
        </p>
      ) : (
        <MovieGrid>
          {movies.map((movie, i) => (
            <MovieCard key={movie.id} movie={movie} priority={i < 6} />
          ))}
        </MovieGrid>
      )}

      <LoadMore
        hasNextPage={!!query.hasNextPage}
        isFetching={query.isFetchingNextPage}
        onLoadMore={() => void query.fetchNextPage()}
      />
    </>
  );
}
