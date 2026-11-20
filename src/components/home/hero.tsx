import { ArrowRight, Flame, Star } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import type { MovieSummary } from "@/server/tmdb/schemas";
import { releaseYear, tmdbImage } from "@/lib/tmdb-image";

export function Hero({
  movie,
  genres,
}: {
  movie: MovieSummary;
  genres: Record<number, string>;
}) {
  const backdrop = tmdbImage(movie.backdrop_path, "original");
  const year = releaseYear(movie.release_date);
  const genreNames = movie.genre_ids
    .map((id) => genres[id])
    .filter(Boolean)
    .slice(0, 3);

  return (
    <section className="relative isolate -mt-16 flex min-h-[70vh] items-end overflow-hidden pt-16">
      {backdrop && (
        <Image
          src={backdrop}
          alt=""
          fill
          priority
          sizes="100vw"
          className="-z-20 object-cover object-top"
        />
      )}
      {/* Fade the backdrop into the page so text stays readable. */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-t from-background via-background/60 to-background/10" />
      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-background/90 via-background/30 to-transparent" />

      <div className="mx-auto w-full max-w-7xl px-4 pb-12 sm:px-6 sm:pb-16">
        <div className="max-w-2xl">
          <p className="flex items-center gap-2 text-sm font-medium text-primary">
            <Flame className="size-4" />
            #1 trending today
          </p>
          <h1 className="mt-3 text-4xl font-bold tracking-tight text-balance sm:text-6xl">
            {movie.title}
          </h1>
          <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
            {movie.vote_average > 0 && (
              <span className="flex items-center gap-1 text-foreground">
                <Star className="size-4 fill-primary text-primary" />
                {movie.vote_average.toFixed(1)}
              </span>
            )}
            {year && <span>{year}</span>}
            {genreNames.length > 0 && <span>{genreNames.join(" · ")}</span>}
          </div>
          {movie.overview && (
            <p className="mt-4 line-clamp-3 text-base text-foreground/80 sm:text-lg">
              {movie.overview}
            </p>
          )}
          <Button asChild size="lg" className="mt-6">
            <Link href={`/movie/${movie.id}`}>
              View details <ArrowRight />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
