import { User } from "lucide-react";
import Image from "next/image";
import { ScrollRow } from "@/components/movie/scroll-row";
import { tmdbImage } from "@/lib/tmdb-image";

type CastMember = {
  id: number;
  name: string;
  character: string;
  profile_path: string | null;
};

export function CastList({ cast }: { cast: CastMember[] }) {
  if (cast.length === 0) return null;

  return (
    <ScrollRow title="Top cast">
      {cast.map((person) => {
        const photo = tmdbImage(person.profile_path, "w185");
        return (
          <div key={person.id} className="w-28 shrink-0 snap-start sm:w-32">
            <div className="relative aspect-[2/3] overflow-hidden rounded-lg bg-muted ring-1 ring-white/10">
              {photo ? (
                <Image
                  src={photo}
                  alt={person.name}
                  fill
                  sizes="128px"
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-muted-foreground">
                  <User className="size-8" />
                </div>
              )}
            </div>
            <p className="mt-2 line-clamp-1 text-sm font-medium">
              {person.name}
            </p>
            {person.character && (
              <p className="line-clamp-2 text-xs text-muted-foreground">
                {person.character}
              </p>
            )}
          </div>
        );
      })}
    </ScrollRow>
  );
}
