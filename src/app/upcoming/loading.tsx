import { Skeleton } from "@/components/ui/skeleton";

/**
 * Shown while a month loads. The first visit to a month in a region looks up
 * each movie's local release date (around 100 TMDB calls, cached afterwards),
 * so without this, clicking "Upcoming" would seem to do nothing for a few
 * seconds.
 */
export default function Loading() {
  return (
    <div
      className="mx-auto max-w-7xl px-4 py-10 sm:px-6"
      aria-busy="true"
      aria-label="Loading release calendar"
    >
      <div className="mb-6 flex items-center justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-9 w-56" />
          <Skeleton className="h-4 w-72" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="size-10 rounded-full" />
          <Skeleton className="size-10 rounded-full" />
        </div>
      </div>
      <div className="overflow-hidden rounded-xl border bg-card/40">
        <div className="h-8 border-b bg-white/[0.02]" />
        <div className="grid grid-cols-7">
          {Array.from({ length: 35 }, (_, i) => (
            <div
              key={i}
              className="min-h-16 border-r border-b p-2 sm:min-h-32 [&:nth-child(7n)]:border-r-0"
            >
              <Skeleton className="size-6 rounded-full" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
