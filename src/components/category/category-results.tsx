"use client";

import { MovieResults } from "@/components/movie-results";

export function CategoryResults({
  genreId,
  name,
}: {
  genreId: number;
  name: string;
}) {
  return (
    <MovieResults
      source={{ kind: "genre", genreId }}
      describe={(total) =>
        `The most popular of ${total.toLocaleString("en-US")} ${name.toLowerCase()} movies`
      }
      emptyMessage={`No ${name.toLowerCase()} movies found.`}
    />
  );
}
