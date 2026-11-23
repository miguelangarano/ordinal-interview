"use client";

import { useQueryClient } from "@tanstack/react-query";
import { ChevronDown } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  flagEmoji,
  REGION_COOKIE,
  REGION_COOKIE_MAX_AGE,
  regionName,
} from "@/lib/regions";
import { cn } from "@/lib/utils";

type Region = { code: string; name: string };

/**
 * Lets the viewer choose their country for "where to watch" and release
 * dates. The choice is saved in a cookie the server reads while rendering.
 */
export function RegionPicker({
  current,
  regions,
}: {
  current: string;
  regions: Region[];
}) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [pending, startTransition] = useTransition();

  const choose = (code: string) => {
    if (code === current) return;
    document.cookie = `${REGION_COOKIE}=${code}; path=/; max-age=${REGION_COOKIE_MAX_AGE}; samesite=lax`;
    // Region-dependent data is cached on both sides; refetch everything.
    queryClient.clear();
    startTransition(() => router.refresh());
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label={`Region: ${regionName(current)}. Change region`}
        className={cn(
          "inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 text-sm font-medium transition hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
          pending && "animate-pulse",
        )}
      >
        <span aria-hidden className="text-base leading-none">
          {flagEmoji(current)}
        </span>
        <span>{current}</span>
        <ChevronDown className="size-4 text-muted-foreground" />
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="max-h-96 w-64 overflow-y-auto"
      >
        <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">
          Region for where to watch and release dates
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuRadioGroup value={current} onValueChange={choose}>
          {regions.map((region) => (
            <DropdownMenuRadioItem key={region.code} value={region.code}>
              <span aria-hidden className="mr-1">
                {flagEmoji(region.code)}
              </span>
              {region.name}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
