"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { LoadMore } from "@/components/load-more";
import { MovieCard, MovieCardSkeleton } from "@/components/movie-card";
import { MovieGrid } from "@/components/movie-grid";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTRPC } from "@/trpc/react";

type Window = "day" | "week";

export function TrendingSection() {
  const trpc = useTRPC();
  const [timeWindow, setTimeWindow] = useState<Window>("day");

  const query = useInfiniteQuery(
    trpc.movies.trending.infiniteQueryOptions(
      { window: timeWindow },
      { getNextPageParam: (last) => last.nextCursor },
    ),
  );

  // TMDB pages can shift while you scroll, so the same movie may appear twice.
  const movies = useMemo(() => {
    const seen = new Set<number>();
    return (query.data?.pages ?? [])
      .flatMap((p) => p.results)
      .filter((m) => !seen.has(m.id) && seen.add(m.id));
  }, [query.data]);

  return (
    <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">
            Trending movies
          </h2>
          <p className="text-sm text-muted-foreground">
            What people are watching{" "}
            {timeWindow === "day" ? "today" : "this week"}.
          </p>
        </div>
        <Tabs value={timeWindow} onValueChange={(v) => setTimeWindow(v as Window)}>
          <TabsList>
            <TabsTrigger value="day">Today</TabsTrigger>
            <TabsTrigger value="week">This week</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {query.isError ? (
        <p className="rounded-lg border border-destructive/40 bg-destructive/10 p-6 text-sm">
          Couldn&apos;t load trending movies.{" "}
          <button
            className="underline underline-offset-4"
            onClick={() => query.refetch()}
          >
            Try again
          </button>
        </p>
      ) : (
        <MovieGrid>
          {query.isPending
            ? Array.from({ length: 18 }, (_, i) => <MovieCardSkeleton key={i} />)
            : movies.map((movie, i) => (
                <MovieCard
                  key={movie.id}
                  movie={movie}
                  rank={i + 1}
                  priority={i < 6}
                />
              ))}
        </MovieGrid>
      )}

      <LoadMore
        hasNextPage={!!query.hasNextPage}
        isFetching={query.isFetchingNextPage}
        onLoadMore={() => void query.fetchNextPage()}
      />
    </section>
  );
}
