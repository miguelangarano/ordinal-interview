"use client";

import { MovieResults } from "@/components/movie-results";

export function SearchResults({ query }: { query: string }) {
  return (
    <MovieResults
      source={{ kind: "search", query }}
      describe={(total) =>
        `${total.toLocaleString("en-US")} ${total === 1 ? "result" : "results"} for “${query}”`
      }
      emptyMessage="No movies match that search. Try a different title."
    />
  );
}
