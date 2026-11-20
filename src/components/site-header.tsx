import { Clapperboard } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";
import { SearchBox } from "@/components/search-box";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-white/5 bg-background/70 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6">
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
    </header>
  );
}
