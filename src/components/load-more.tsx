"use client";

import { Loader2 } from "lucide-react";
import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";

/**
 * Loads the next page automatically when scrolled into view, with a button
 * fallback (and for keyboard users).
 */
export function LoadMore({
  hasNextPage,
  isFetching,
  onLoadMore,
}: {
  hasNextPage: boolean;
  isFetching: boolean;
  onLoadMore: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || !hasNextPage) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting && !isFetching) onLoadMore();
      },
      { rootMargin: "600px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasNextPage, isFetching, onLoadMore]);

  if (!hasNextPage) return null;

  return (
    <div ref={ref} className="flex justify-center py-10">
      <Button variant="secondary" onClick={onLoadMore} disabled={isFetching}>
        {isFetching && <Loader2 className="animate-spin" />}
        {isFetching ? "Loading" : "Load more"}
      </Button>
    </div>
  );
}
