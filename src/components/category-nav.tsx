"use client";

import { CalendarDays, ChevronDown } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

type Genre = { id: number; name: string };

const pill =
  "inline-flex h-8 shrink-0 items-center gap-1.5 rounded-full px-3.5 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none";

export function CategoryNav({ top, rest }: { top: Genre[]; rest: Genre[] }) {
  const pathname = usePathname();
  const activeId = pathname.startsWith("/category/")
    ? Number(pathname.split("/")[2])
    : null;
  const activeInMore = rest.find((g) => g.id === activeId);

  return (
    // Vertical padding matters: horizontal scrolling also clips the y axis, so
    // without it the Upcoming button's ring and glow get cut off.
    <nav
      aria-label="Categories"
      className="scrollbar-none -mx-4 flex items-center gap-2 overflow-x-auto px-4 pt-1.5 pb-2.5 sm:-mx-6 sm:px-6"
    >
      <Link
        href="/upcoming"
        aria-current={pathname === "/upcoming" ? "page" : undefined}
        className={cn(
          pill,
          "bg-gradient-to-r from-amber-400 to-orange-500 text-black shadow-lg shadow-orange-500/20 hover:brightness-110",
          pathname === "/upcoming" && "ring-2 ring-amber-200/70",
        )}
      >
        <CalendarDays className="size-4" />
        Upcoming
      </Link>

      <span aria-hidden className="mx-1 h-5 w-px shrink-0 bg-white/10" />

      {top.map((genre) => (
        <CategoryLink
          key={genre.id}
          genre={genre}
          active={genre.id === activeId}
        />
      ))}

      {rest.length > 0 && (
        <DropdownMenu>
          <DropdownMenuTrigger
            className={cn(
              pill,
              activeInMore
                ? "bg-primary text-primary-foreground"
                : "bg-white/5 text-foreground/80 hover:bg-white/10 hover:text-foreground",
            )}
          >
            {activeInMore?.name ?? "More"}
            <ChevronDown className="size-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="start"
            className="max-h-80 w-48 overflow-y-auto"
          >
            {rest.map((genre) => (
              <DropdownMenuItem key={genre.id} asChild>
                <Link
                  href={`/category/${genre.id}`}
                  aria-current={genre.id === activeId ? "page" : undefined}
                  className={cn(
                    genre.id === activeId && "font-semibold text-primary",
                  )}
                >
                  {genre.name}
                </Link>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </nav>
  );
}

function CategoryLink({ genre, active }: { genre: Genre; active: boolean }) {
  return (
    <Link
      href={`/category/${genre.id}`}
      aria-current={active ? "page" : undefined}
      className={cn(
        pill,
        active
          ? "bg-primary text-primary-foreground"
          : "bg-white/5 text-foreground/80 hover:bg-white/10 hover:text-foreground",
      )}
    >
      {genre.name}
    </Link>
  );
}
