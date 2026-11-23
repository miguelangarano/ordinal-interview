"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { MovieCard, MovieCardSkeleton } from "@/components/movie-card";
import { CAROUSEL_BATCH } from "@/lib/batch-sizes";
import type { ListSource } from "@/server/api/routers/movies";
import { useTRPC } from "@/trpc/react";
import { cn } from "@/lib/utils";

const cardWidth = "w-36 sm:w-40 lg:w-44";

export function MovieCarousel({
  title,
  subtitle,
  source,
  href,
  ranked = false,
}: {
  title: string;
  subtitle?: string;
  source: ListSource;
  /** "See all" destination. */
  href?: string;
  /** Show #1, #2… badges. */
  ranked?: boolean;
}) {
  const trpc = useTRPC();
  const query = useInfiniteQuery(
    trpc.movies.list.infiniteQueryOptions(
      { source, limit: CAROUSEL_BATCH },
      { getNextPageParam: (last) => last.nextCursor },
    ),
  );

  const movies = useMemo(() => {
    const seen = new Set<number>();
    return (query.data?.pages ?? [])
      .flatMap((p) => p.results)
      .filter((m) => !seen.has(m.id) && seen.add(m.id));
  }, [query.data]);

  const scroller = useRef<HTMLDivElement>(null);
  const [edges, setEdges] = useState({ start: true, end: false });
  const { hasNextPage, isFetchingNextPage, fetchNextPage } = query;

  const update = useCallback(() => {
    const el = scroller.current;
    if (!el) return;
    const remaining = el.scrollWidth - el.clientWidth - el.scrollLeft;
    setEdges({ start: el.scrollLeft <= 4, end: remaining <= 4 });
    // Nearly at the last loaded movie: fetch the next batch so it's ready.
    if (
      remaining < el.clientWidth * 0.75 &&
      hasNextPage &&
      !isFetchingNextPage
    ) {
      void fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  // Re-check whenever content or size changes (new batch, resize).
  useEffect(() => {
    update();
    const el = scroller.current;
    if (!el) return;
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, [update, movies.length]);

  /** Scroll by one visible group of cards. */
  const page = (direction: 1 | -1) => {
    const el = scroller.current;
    if (!el) return;
    el.scrollBy({ left: direction * el.clientWidth * 0.9, behavior: "smooth" });
  };

  if (query.isError) return null; // A row failing shouldn't break the page.
  if (query.isSuccess && movies.length === 0) return null;

  return (
    <section aria-label={title} className="group/row relative py-4">
      <div className="mb-1 flex items-end justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">
            {title}
          </h2>
          {subtitle && (
            <p className="text-sm text-muted-foreground">{subtitle}</p>
          )}
        </div>
        {href && (
          <Link
            href={href}
            className="shrink-0 text-sm font-medium text-primary hover:underline"
          >
            See all
          </Link>
        )}
      </div>

      <div className="relative">
        <div
          ref={scroller}
          onScroll={update}
          className="scrollbar-none -mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-px-4 px-4 pt-3 pb-4 sm:-mx-6 sm:scroll-px-6 sm:px-6"
        >
          {query.isPending
            ? Array.from({ length: 8 }, (_, i) => (
                <div key={i} className={cn(cardWidth, "shrink-0")}>
                  <MovieCardSkeleton />
                </div>
              ))
            : movies.map((movie, i) => (
                <MovieCard
                  key={movie.id}
                  movie={movie}
                  rank={ranked ? i + 1 : undefined}
                  className={cn(cardWidth, "shrink-0 snap-start")}
                />
              ))}
          {isFetchingNextPage &&
            Array.from({ length: 3 }, (_, i) => (
              <div key={`more-${i}`} className={cn(cardWidth, "shrink-0")}>
                <MovieCardSkeleton />
              </div>
            ))}
        </div>

        <ArrowButton
          direction={-1}
          hidden={edges.start}
          onClick={() => page(-1)}
          label={`Previous ${title}`}
        />
        <ArrowButton
          direction={1}
          hidden={edges.end && !hasNextPage}
          onClick={() => page(1)}
          label={`Next ${title}`}
        />
      </div>
    </section>
  );
}

function ArrowButton({
  direction,
  hidden,
  onClick,
  label,
}: {
  direction: 1 | -1;
  hidden: boolean;
  onClick: () => void;
  label: string;
}) {
  const Icon = direction === 1 ? ChevronRight : ChevronLeft;
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      tabIndex={hidden ? -1 : 0}
      className={cn(
        // Vertically centred on the posters (not the titles below them).
        "absolute top-[calc(0.75rem+var(--poster-h)/2)] z-20 hidden size-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/10 bg-background/80 text-foreground shadow-xl backdrop-blur transition hover:bg-primary hover:text-primary-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none md:flex md:[--poster-h:15rem] lg:[--poster-h:16.5rem]",
        direction === 1 ? "-right-3" : "-left-3",
        "opacity-0 group-hover/row:opacity-100 focus-visible:opacity-100",
        hidden && "pointer-events-none !opacity-0",
      )}
    >
      <Icon className="size-5" />
    </button>
  );
}
