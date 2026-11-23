import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { ReleaseCalendar } from "@/components/upcoming/release-calendar";
import { addMonths, isMonth, monthLabel, monthOf } from "@/lib/month";
import {
  readCookie,
  REGION_COOKIE,
  regionName,
  resolveRegion,
} from "@/lib/regions";
import { api } from "@/trpc/server";

type Props = { searchParams: Promise<{ month?: string }> };

/** How far ahead the calendar goes; TMDB data thins out beyond a year. */
const MAX_MONTHS_AHEAD = 18;

export async function generateMetadata({
  searchParams,
}: Props): Promise<Metadata> {
  const { month } = await searchParams;
  return {
    title: `Upcoming · ${monthLabel(isMonth(month) ? month : monthOf(new Date()))}`,
  };
}

export default async function UpcomingPage({ searchParams }: Props) {
  const now = new Date();
  const current = monthOf(now);
  const latest = addMonths(current, MAX_MONTHS_AHEAD);
  const requested = (await searchParams).month;

  // "Upcoming" starts at this month; send out-of-range months back in range.
  if (requested !== undefined) {
    if (!isMonth(requested) || requested < current) redirect("/upcoming");
    if (requested > latest) redirect(`/upcoming?month=${latest}`);
  }
  const month = requested ?? current;

  const requestHeaders = await headers();
  const region = resolveRegion({
    cookie: readCookie(requestHeaders.get("cookie"), REGION_COOKIE),
    ipCountry: requestHeaders.get("x-vercel-ip-country"),
  });
  const movies = await api.movies.upcoming({ month });

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <ReleaseCalendar
        month={month}
        today={now.toISOString().slice(0, 10)}
        movies={movies.map((m) => ({
          id: m.id,
          title: m.title,
          poster_path: m.poster_path,
          release_date: m.release_date,
        }))}
        canGoBack={month > current}
        regionLabel={regionName(region)}
      />
    </div>
  );
}
