import { Film, Star } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import { releaseYear, tmdbImage } from "@/lib/tmdb-image";
import { cn } from "@/lib/utils";

export type MovieCardData = {
  id: number;
  title: string;
  poster_path: string | null;
  release_date: string;
  vote_average: number;
};

export function MovieCard({
  movie,
  rank,
  priority,
  className,
}: {
  movie: MovieCardData;
  rank?: number;
  priority?: boolean;
  className?: string;
}) {
  const poster = tmdbImage(movie.poster_path, "w342");
  const year = releaseYear(movie.release_date);

  return (
    <Link
      href={`/movie/${movie.id}`}
      className={cn(
        "group relative block focus-visible:outline-none hover:z-10 focus-visible:z-10",
        className,
      )}
    >
      <div className="relative aspect-[2/3] overflow-hidden rounded-lg bg-muted ring-1 ring-white/10 transition duration-300 ease-out will-change-transform group-hover:scale-[1.06] group-hover:ring-primary/70 group-hover:shadow-2xl group-hover:shadow-primary/10 group-focus-visible:ring-2 group-focus-visible:ring-primary">
        {poster ? (
          <Image
            src={poster}
            alt={`${movie.title} poster`}
            fill
            priority={priority}
            sizes="(min-width: 1280px) 200px, (min-width: 768px) 22vw, 45vw"
            className="object-cover"
          />
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-2 p-4 text-center text-sm text-muted-foreground">
            <Film className="size-6" />
            {movie.title}
          </div>
        )}
        {rank !== undefined && (
          <span className="absolute top-2 left-2 rounded-md bg-black/70 px-1.5 py-0.5 font-mono text-xs font-semibold text-white backdrop-blur">
            #{rank}
          </span>
        )}
        {movie.vote_average > 0 && (
          <span className="absolute top-2 right-2 flex items-center gap-1 rounded-md bg-black/70 px-1.5 py-0.5 text-xs font-medium text-white backdrop-blur">
            <Star className="size-3 fill-primary text-primary" />
            {movie.vote_average.toFixed(1)}
          </span>
        )}
      </div>
      <div className="mt-2 px-0.5">
        <h3 className="line-clamp-1 text-sm font-medium group-hover:text-primary">
          {movie.title}
        </h3>
        {year && <p className="text-xs text-muted-foreground">{year}</p>}
      </div>
    </Link>
  );
}

export function MovieCardSkeleton() {
  return (
    <div>
      <Skeleton className="aspect-[2/3] rounded-lg" />
      <Skeleton className="mt-2 h-4 w-3/4" />
      <Skeleton className="mt-1 h-3 w-1/4" />
    </div>
  );
}
