"use client";

import { Search } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Input } from "@/components/ui/input";

/**
 * Header search. Typing navigates to /search?q=… (debounced), so results are
 * shareable and the back button works as expected.
 */
export function SearchBox() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const urlQuery = pathname === "/search" ? (params.get("q") ?? "") : "";
  const [value, setValue] = useState(urlQuery);
  // The last query this component navigated to, so URL updates we caused
  // ourselves don't overwrite what the user is still typing.
  const lastPushed = useRef(urlQuery);

  // Sync the input when the URL changes from elsewhere (back/forward, links).
  useEffect(() => {
    if (urlQuery !== lastPushed.current) {
      lastPushed.current = urlQuery;
      setValue(urlQuery);
    }
  }, [urlQuery]);

  useEffect(() => {
    const q = value.trim();
    if (q === urlQuery.trim()) return;
    const id = setTimeout(() => {
      lastPushed.current = q;
      if (q) {
        const url = `/search?q=${encodeURIComponent(q)}`;
        if (pathname === "/search") router.replace(url);
        else router.push(url);
      } else if (pathname === "/search") {
        // Clearing the search returns to the trending homepage.
        router.replace("/");
      }
    }, 300);
    return () => clearTimeout(id);
  }, [value, urlQuery, pathname, router]);

  return (
    <form
      role="search"
      onSubmit={(e) => {
        e.preventDefault();
        const q = value.trim();
        if (q) router.push(`/search?q=${encodeURIComponent(q)}`);
      }}
      className="relative"
    >
      <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        type="search"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Search movies…"
        aria-label="Search movies"
        className="h-9 rounded-full bg-white/5 pl-9"
      />
    </form>
  );
}
