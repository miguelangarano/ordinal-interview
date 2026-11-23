"use client";

import { X } from "lucide-react";
import { animate, motion, useReducedMotion } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useLayoutEffect, useRef } from "react";
import { dayLabel } from "@/lib/month";
import { tmdbImage } from "@/lib/tmdb-image";

export type BurstMovie = {
  id: number;
  title: string;
  poster_path: string | null;
};

type Point = { x: number; y: number };

const SPARKS = 14;

/**
 * Full-screen overlay where a day's releases explode out of the calendar
 * cell that was clicked (`origin`) and settle into a grid.
 */
export function ReleaseBurst({
  date,
  movies,
  origin,
  onClose,
}: {
  date: string;
  movies: BurstMovie[];
  origin: Point;
  onClose: () => void;
}) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const reduceMotion = useReducedMotion();

  // Modal behaviour: Escape closes, focus moves in, the page stops scrolling.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflow;
    };
  }, [onClose]);

  return (
    <motion.div
      role="dialog"
      aria-modal="true"
      aria-label={`Releases on ${dayLabel(date)}`}
      className="fixed inset-0 z-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.2 } }}
    >
      <div
        aria-hidden
        className="absolute inset-0 bg-black/80 backdrop-blur-md"
      />

      {!reduceMotion && <Explosion origin={origin} />}

      {/* Scrollable layer; clicking its empty background closes the burst. */}
      <div
        className="relative flex h-full flex-col items-center overflow-y-auto px-4 py-10 sm:px-6"
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <div className="mb-6 flex w-full max-w-5xl items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-primary">
              {movies.length} {movies.length === 1 ? "release" : "releases"}
            </p>
            <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              {dayLabel(date)}
            </h2>
          </div>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex size-10 shrink-0 items-center justify-center rounded-full bg-white/10 transition hover:bg-white/20 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
          >
            <X className="size-5" />
          </button>
        </div>

        <ul className="grid w-full max-w-5xl grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {movies.map((movie, i) => (
            <BurstItem
              key={movie.id}
              movie={movie}
              index={i}
              origin={origin}
              animated={!reduceMotion}
            />
          ))}
        </ul>
      </div>
    </motion.div>
  );
}

/** A poster that flies from the clicked cell to its place in the grid. */
function BurstItem({
  movie,
  index,
  origin,
  animated,
}: {
  movie: BurstMovie;
  index: number;
  origin: Point;
  animated: boolean;
}) {
  const ref = useRef<HTMLLIElement>(null);

  // Measure where the poster landed, then animate it from the origin. Runs
  // before paint, so there's no flash of posters in their final spot.
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el || !animated) return;
    const rect = el.getBoundingClientRect();
    const dx = origin.x - (rect.left + rect.width / 2);
    const dy = origin.y - (rect.top + rect.height / 2);
    const spin = (index % 2 ? 1 : -1) * (20 + ((index * 37) % 40));

    const controls = animate(
      el,
      {
        x: [dx, 0],
        y: [dy, 0],
        scale: [0.1, 1],
        rotate: [spin, 0],
        opacity: [0, 1],
      },
      {
        type: "spring",
        stiffness: 210,
        damping: 19,
        delay: 0.08 + index * 0.035,
        opacity: { duration: 0.15, delay: 0.08 + index * 0.035 },
      },
    );
    return () => controls.stop();
  }, [animated, index, origin.x, origin.y]);

  const poster = tmdbImage(movie.poster_path, "w342");

  return (
    <li ref={ref} style={animated ? { opacity: 0 } : undefined}>
      <Link href={`/movie/${movie.id}`} className="group block">
        <div className="relative aspect-[2/3] overflow-hidden rounded-lg bg-muted shadow-2xl ring-1 ring-white/10 transition duration-300 group-hover:scale-[1.06] group-hover:ring-primary/70">
          {poster && (
            <Image
              src={poster}
              alt={`${movie.title} poster`}
              fill
              sizes="(min-width: 1024px) 200px, (min-width: 640px) 30vw, 45vw"
              className="object-cover"
            />
          )}
        </div>
        <p className="mt-2 line-clamp-2 text-sm font-medium group-hover:text-primary">
          {movie.title}
        </p>
      </Link>
    </li>
  );
}

/** A flash and a ring of sparks bursting out of the clicked day. */
function Explosion({ origin }: { origin: Point }) {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <motion.div
        className="absolute size-24 rounded-full bg-[radial-gradient(circle,var(--color-primary)_0%,rgba(249,115,22,0.6)_35%,transparent_70%)]"
        style={{ left: origin.x - 48, top: origin.y - 48 }}
        initial={{ scale: 0, opacity: 1 }}
        animate={{ scale: 14, opacity: 0 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
      />
      <motion.div
        className="absolute size-16 rounded-full border-2 border-primary"
        style={{ left: origin.x - 32, top: origin.y - 32 }}
        initial={{ scale: 0.2, opacity: 1 }}
        animate={{ scale: 9, opacity: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      />
      {Array.from({ length: SPARKS }, (_, i) => {
        const angle = (i / SPARKS) * Math.PI * 2;
        const distance = 140 + ((i * 53) % 90);
        return (
          <motion.span
            key={i}
            className="absolute size-2 rounded-full bg-primary shadow-[0_0_12px_var(--color-primary)]"
            style={{ left: origin.x - 4, top: origin.y - 4 }}
            initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
            animate={{
              x: Math.cos(angle) * distance,
              y: Math.sin(angle) * distance,
              opacity: 0,
              scale: 0.3,
            }}
            transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
          />
        );
      })}
    </div>
  );
}
