import { Clapperboard } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";
import { CategoryNav } from "@/components/category-nav";
import { SearchBox } from "@/components/search-box";
import { api } from "@/trpc/server";

export async function SiteHeader() {
  // The nav is a nice-to-have; never let a TMDB hiccup take the page down.
  const genres = await api.movies
    .topGenres()
    .catch(() => ({ top: [], rest: [] }));

  return (
    <header className="sticky top-0 z-40 border-b border-white/5 bg-background/70 backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex h-16 items-center gap-4">
          <Link
            href="/"
            className="flex shrink-0 items-center gap-2 font-semibold tracking-tight"
          >
            <Clapperboard className="size-5 text-primary" />
            <span className="hidden sm:inline">Reel</span>
          </Link>
          <div className="ml-auto w-full max-w-sm">
            <Suspense>
              <SearchBox />
            </Suspense>
          </div>
        </div>
        <CategoryNav top={genres.top} rest={genres.rest} />
      </div>
    </header>
  );
}
