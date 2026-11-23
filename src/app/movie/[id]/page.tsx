import { TRPCError } from "@trpc/server";
import { ExternalLink, Star } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { cache, Suspense } from "react";
import { MovieCard } from "@/components/movie-card";
import { CastList } from "@/components/movie/cast-list";
import { ScrollRow } from "@/components/movie/scroll-row";
import { TrailerButton } from "@/components/movie/trailer-button";
import { WatchProviders } from "@/components/movie/watch-providers";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatRuntime, releaseYear, tmdbImage } from "@/lib/tmdb-image";
import { api } from "@/trpc/server";

type Props = { params: Promise<{ id: string }> };

/** Shared by generateMetadata and the page so TMDB is only hit once. */
const getMovie = cache(async (rawId: string) => {
  const id = Number(rawId);
  if (!Number.isInteger(id) || id <= 0) notFound();
  try {
    return await api.movies.byId({ id });
  } catch (err) {
    if (err instanceof TRPCError && err.code === "NOT_FOUND") notFound();
    throw err;
  }
});

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const movie = await getMovie((await params).id);
  const year = releaseYear(movie.releaseDate);
  const poster = tmdbImage(movie.posterPath, "w500");
  return {
    title: year ? `${movie.title} (${year})` : movie.title,
    description: movie.overview,
    openGraph: poster ? { images: [poster] } : undefined,
  };
}

type Cast = Awaited<ReturnType<typeof getMovie>>["cast"];

async function CastWithWikipedia({ cast }: { cast: Cast }) {
  const wikipediaUrls = await api.movies
    .castWikipedia({ personIds: cast.map((c) => c.id) })
    .catch(() => ({}));
  return <CastList cast={cast} wikipediaUrls={wikipediaUrls} />;
}

const usd = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  notation: "compact",
  maximumFractionDigits: 1,
});

const longDate = new Intl.DateTimeFormat("en-US", {
  dateStyle: "long",
  timeZone: "UTC",
});

export default async function MoviePage({ params }: Props) {
  const movie = await getMovie((await params).id);

  const backdrop = tmdbImage(movie.backdropPath, "original");
  const poster = tmdbImage(movie.posterPath, "w500");
  const year = releaseYear(movie.releaseDate);
  const runtime = formatRuntime(movie.runtime);

  // Shown with the credits in the header. "Released" is the norm, so status
  // only appears when it says something (e.g. "In Production").
  const facts = [
    ...(movie.directors.length > 0
      ? [
          [
            movie.directors.length > 1 ? "Directors" : "Director",
            movie.directors.join(", "),
          ],
        ]
      : []),
    ...(movie.writers.length > 0
      ? [["Writing", movie.writers.join(", ")]]
      : []),
    [
      "Release date",
      movie.releaseDate ? longDate.format(new Date(movie.releaseDate)) : null,
    ],
    [
      "Status",
      movie.status && movie.status !== "Released" ? movie.status : null,
    ],
    [
      "Original title",
      movie.originalTitle !== movie.title ? movie.originalTitle : null,
    ],
    ["Budget", movie.budget > 0 ? usd.format(movie.budget) : null],
    ["Box office", movie.revenue > 0 ? usd.format(movie.revenue) : null],
  ].filter((f): f is [string, string] => Boolean(f[1]));

  return (
    <article>
      {/* Backdrop header */}
      <div className="relative isolate mt-[calc(var(--header-height)*-1)] overflow-hidden pt-(--header-height)">
        {backdrop && (
          <Image
            src={backdrop}
            alt=""
            fill
            priority
            sizes="100vw"
            className="-z-20 object-cover object-top opacity-50"
          />
        )}
        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-background via-background/70 to-background/20" />

        <div className="mx-auto grid max-w-7xl gap-8 px-4 pt-10 pb-8 sm:px-6 md:grid-cols-[260px_1fr] md:pt-24 lg:grid-cols-[300px_1fr]">
          <div className="relative mx-auto aspect-[2/3] w-48 overflow-hidden rounded-xl bg-muted shadow-2xl ring-1 ring-white/10 md:w-full">
            {poster && (
              <Image
                src={poster}
                alt={`${movie.title} poster`}
                fill
                priority
                sizes="(min-width: 768px) 300px, 192px"
                className="object-cover"
              />
            )}
          </div>

          <div className="flex flex-col justify-end">
            <h1 className="text-3xl font-bold tracking-tight text-balance sm:text-5xl">
              {movie.title}
              {year && (
                <span className="ml-3 font-normal text-muted-foreground">
                  {year}
                </span>
              )}
            </h1>
            {movie.tagline && (
              <p className="mt-2 text-lg text-muted-foreground italic">
                {movie.tagline}
              </p>
            )}

            <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
              {movie.voteAverage > 0 && (
                <span className="flex items-center gap-1.5">
                  <Star className="size-4 fill-primary text-primary" />
                  <span className="font-semibold">
                    {movie.voteAverage.toFixed(1)}
                  </span>
                  <span className="text-muted-foreground">
                    ({movie.voteCount.toLocaleString("en-US")} votes)
                  </span>
                </span>
              )}
              {runtime && (
                <span className="text-muted-foreground">{runtime}</span>
              )}
              <div className="flex flex-wrap gap-1.5">
                {movie.genres.map((g) => (
                  <Badge key={g.id} variant="secondary">
                    {g.name}
                  </Badge>
                ))}
              </div>
            </div>

            {movie.overview && (
              <p className="mt-6 max-w-3xl text-base leading-relaxed text-foreground/90">
                {movie.overview}
              </p>
            )}

            {facts.length > 0 && (
              <dl className="mt-6 grid grid-cols-2 gap-x-8 gap-y-4 text-sm sm:flex sm:flex-wrap sm:gap-x-10">
                {facts.map(([label, value]) => (
                  <div key={label} className="min-w-0">
                    <dt className="text-muted-foreground">{label}</dt>
                    <dd className="font-medium">{value}</dd>
                  </div>
                ))}
              </dl>
            )}

            <div className="mt-8 flex flex-wrap gap-3">
              {movie.trailerKey && (
                <TrailerButton
                  videoKey={movie.trailerKey}
                  title={movie.title}
                />
              )}
              {movie.imdbId && (
                <Button asChild size="lg" variant="secondary">
                  <a
                    href={`https://www.imdb.com/title/${movie.imdbId}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    IMDb <ExternalLink />
                  </a>
                </Button>
              )}
              {movie.homepage && (
                <Button asChild size="lg" variant="ghost">
                  <a href={movie.homepage} target="_blank" rel="noreferrer">
                    Official site <ExternalLink />
                  </a>
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <WatchProviders watch={movie.watch} region={movie.watchRegion} />
        {/* Render the cast immediately; Wikipedia links stream in after. */}
        <Suspense fallback={<CastList cast={movie.cast} />}>
          <CastWithWikipedia cast={movie.cast} />
        </Suspense>
      </div>

      {movie.recommendations.length > 0 && (
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <ScrollRow title="You might also like">
            {movie.recommendations.map((rec) => (
              <MovieCard
                key={rec.id}
                movie={rec}
                className="w-36 shrink-0 snap-start sm:w-40"
              />
            ))}
          </ScrollRow>
        </div>
      )}
    </article>
  );
}
