"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { AnimatePresence } from "motion/react";
import Image from "next/image";
import { useCallback, useMemo, useRef, useState } from "react";
import { addMonths, daysInMonth, firstWeekday, monthLabel } from "@/lib/month";
import { tmdbImage } from "@/lib/tmdb-image";
import { cn } from "@/lib/utils";
import { type BurstMovie, ReleaseBurst } from "./release-burst";

type CalendarMovie = BurstMovie & { release_date: string };

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function ReleaseCalendar({
  month,
  today,
  movies,
  canGoBack,
  regionLabel,
}: {
  /** "YYYY-MM" */
  month: string;
  /** "YYYY-MM-DD", computed on the server so hydration matches. */
  today: string;
  movies: CalendarMovie[];
  canGoBack: boolean;
  /** e.g. "United Kingdom": the country whose release dates are shown. */
  regionLabel: string;
}) {
  // Movies arrive most-anticipated first; keep that order within each day.
  const byDay = useMemo(() => {
    const map = new Map<number, CalendarMovie[]>();
    for (const movie of movies) {
      const day = Number(movie.release_date.slice(8, 10));
      map.set(day, [...(map.get(day) ?? []), movie]);
    }
    return map;
  }, [movies]);

  const [burst, setBurst] = useState<{
    day: number;
    origin: { x: number; y: number };
  } | null>(null);
  const lastTrigger = useRef<HTMLButtonElement | null>(null);

  const close = useCallback(() => {
    setBurst(null);
    lastTrigger.current?.focus(); // Return focus to the day that opened it.
  }, []);

  const total = daysInMonth(month);
  const leading = firstWeekday(month);
  const trailing = (7 - ((leading + total) % 7)) % 7;

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">
            {monthLabel(month)}
          </h1>
          <p className="text-sm text-muted-foreground">
            {movies.length > 0
              ? `${movies.length} anticipated releases in ${regionLabel}. Click a day to see them.`
              : `No releases found in ${regionLabel} for this month yet.`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <MonthLink
            month={addMonths(month, -1)}
            disabled={!canGoBack}
            label="Previous month"
          >
            <ChevronLeft className="size-5" />
          </MonthLink>
          <MonthLink month={addMonths(month, 1)} label="Next month">
            <ChevronRight className="size-5" />
          </MonthLink>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border bg-card/40">
        <div className="grid grid-cols-7 border-b bg-white/[0.02] text-center text-xs font-medium tracking-wide text-muted-foreground uppercase">
          {WEEKDAYS.map((d) => (
            <div key={d} className="py-2">
              <span className="sm:hidden">{d[0]}</span>
              <span className="hidden sm:inline">{d}</span>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 [&>*]:border-r [&>*]:border-b [&>*:nth-child(7n)]:border-r-0">
          {Array.from({ length: leading }, (_, i) => (
            <div key={`lead-${i}`} className="bg-black/20" />
          ))}

          {Array.from({ length: total }, (_, i) => {
            const day = i + 1;
            const date = `${month}-${String(day).padStart(2, "0")}`;
            return (
              <DayCell
                key={day}
                day={day}
                movies={byDay.get(day) ?? []}
                isToday={date === today}
                isPast={date < today}
                onOpen={(trigger) => {
                  lastTrigger.current = trigger;
                  const rect = trigger.getBoundingClientRect();
                  setBurst({
                    day,
                    origin: {
                      x: rect.left + rect.width / 2,
                      y: rect.top + rect.height / 2,
                    },
                  });
                }}
              />
            );
          })}

          {Array.from({ length: trailing }, (_, i) => (
            <div key={`trail-${i}`} className="bg-black/20" />
          ))}
        </div>
      </div>

      <AnimatePresence>
        {burst && (
          <ReleaseBurst
            key={burst.day}
            date={`${month}-${String(burst.day).padStart(2, "0")}`}
            movies={byDay.get(burst.day) ?? []}
            origin={burst.origin}
            onClose={close}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function DayCell({
  day,
  movies,
  isToday,
  isPast,
  onOpen,
}: {
  day: number;
  movies: CalendarMovie[];
  isToday: boolean;
  isPast: boolean;
  onOpen: (trigger: HTMLButtonElement) => void;
}) {
  const dayNumber = (
    <span
      className={cn(
        "flex h-7 min-w-7 items-center justify-center rounded-full px-1 text-sm",
        isToday && "bg-primary font-semibold text-primary-foreground",
      )}
    >
      {day}
    </span>
  );

  const base =
    "relative flex min-h-16 flex-col p-1.5 text-left sm:min-h-32 sm:p-2";

  if (movies.length === 0) {
    return (
      <div
        className={cn(base, "text-muted-foreground", isPast && "opacity-50")}
      >
        {dayNumber}
      </div>
    );
  }

  const preview = movies.slice(0, 3);
  const extra = movies.length - preview.length;

  return (
    <button
      type="button"
      onClick={(e) => onOpen(e.currentTarget)}
      aria-label={`${movies.length} ${movies.length === 1 ? "release" : "releases"} on day ${day}`}
      className={cn(
        base,
        "group transition-colors hover:bg-primary/10 focus-visible:z-10 focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none focus-visible:ring-inset",
        isPast && "opacity-60 hover:opacity-100",
      )}
    >
      <div className="flex items-center justify-between gap-1">
        {dayNumber}
        <span className="rounded-full bg-primary/15 px-1.5 text-[11px] font-semibold text-primary sm:text-xs">
          {movies.length}
        </span>
      </div>

      {/* Fanned poster preview (hidden on phones, where cells are tiny). */}
      <div className="mt-auto hidden items-end pt-2 pl-1 sm:flex">
        {preview.map((movie, i) => {
          const poster = tmdbImage(movie.poster_path, "w92");
          return (
            <div
              key={movie.id}
              className={cn(
                "relative -ml-3 aspect-[2/3] w-9 overflow-hidden rounded-md bg-muted shadow-lg ring-1 ring-black/40 transition duration-300 first:ml-0 lg:w-11",
                i === 0 &&
                  "-rotate-6 group-hover:-translate-x-1 group-hover:-rotate-12",
                i === 1 && "z-10 group-hover:-translate-y-1",
                i === 2 &&
                  "rotate-6 group-hover:translate-x-1 group-hover:rotate-12",
              )}
            >
              {poster && (
                <Image
                  src={poster}
                  alt=""
                  fill
                  sizes="44px"
                  className="object-cover"
                />
              )}
            </div>
          );
        })}
        {extra > 0 && (
          <span className="ml-2 text-xs font-medium text-muted-foreground">
            +{extra}
          </span>
        )}
      </div>
    </button>
  );
}

function MonthLink({
  month,
  disabled,
  label,
  children,
}: {
  month: string;
  disabled?: boolean;
  label: string;
  children: React.ReactNode;
}) {
  const className =
    "flex size-10 items-center justify-center rounded-full border bg-white/5 transition hover:bg-white/10";
  if (disabled) {
    return (
      <span aria-disabled className={cn(className, "opacity-30")}>
        {children}
      </span>
    );
  }
  // A plain link (full page load) on purpose. With next/link, clicking a
  // month arrow while the previous month was still streaming in was
  // sometimes ignored by the client router, leaving you on the wrong month.
  // Each month is server-rendered anyway, and loading.tsx still streams first.
  return (
    <a
      href={`/upcoming?month=${month}`}
      aria-label={label}
      className={className}
    >
      {children}
    </a>
  );
}
