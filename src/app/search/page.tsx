import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { SearchResults } from "@/components/search/search-results";

type Props = { searchParams: Promise<{ q?: string | string[] }> };

function readQuery(q: string | string[] | undefined) {
  return (Array.isArray(q) ? q[0] : q)?.trim() ?? "";
}

export async function generateMetadata({
  searchParams,
}: Props): Promise<Metadata> {
  const q = readQuery((await searchParams).q);
  return { title: q ? `Search: ${q}` : "Search" };
}

export default async function SearchPage({ searchParams }: Props) {
  const q = readQuery((await searchParams).q);
  // Nothing to search for: send people back to the trending homepage.
  if (!q) redirect("/");

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <h1 className="mb-1 text-2xl font-semibold tracking-tight">Search</h1>
      {/* Keyed so a new query starts with a fresh list. */}
      <SearchResults key={q} query={q} />
    </div>
  );
}
