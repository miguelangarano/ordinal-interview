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

export function CastList({
  cast,
  wikipediaUrls = {},
}: {
  cast: CastMember[];
  /** English Wikipedia article per person id, when one exists. */
  wikipediaUrls?: Record<number, string>;
}) {
  if (cast.length === 0) return null;

  return (
    <ScrollRow title="Top cast">
      {cast.map((person) => {
        const wikipedia = wikipediaUrls[person.id];
        const card = <CastCard person={person} hasLink={!!wikipedia} />;
        return wikipedia ? (
          <a
            key={person.id}
            href={wikipedia}
            target="_blank"
            rel="noreferrer"
            aria-label={`${person.name} on Wikipedia (opens in a new tab)`}
            className="group w-28 shrink-0 snap-start focus-visible:outline-none sm:w-32"
          >
            {card}
          </a>
        ) : (
          <div key={person.id} className="w-28 shrink-0 snap-start sm:w-32">
            {card}
          </div>
        );
      })}
    </ScrollRow>
  );
}

function CastCard({
  person,
  hasLink,
}: {
  person: CastMember;
  hasLink: boolean;
}) {
  const photo = tmdbImage(person.profile_path, "w185");
  return (
    <>
      <div className="relative aspect-[2/3] overflow-hidden rounded-lg bg-muted ring-1 ring-white/10 transition duration-300 ease-out will-change-transform group-hover:scale-[1.06] group-hover:ring-primary/70 group-hover:shadow-2xl group-hover:shadow-primary/10 group-focus-visible:ring-2 group-focus-visible:ring-primary">
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
        {hasLink && (
          <span
            aria-hidden
            title="Wikipedia"
            className="absolute right-1.5 bottom-1.5 flex size-6 items-center justify-center rounded-full bg-black/70 font-serif text-xs font-semibold text-white backdrop-blur transition group-hover:bg-primary group-hover:text-primary-foreground"
          >
            W
          </span>
        )}
      </div>
      <p className="mt-2 line-clamp-1 text-sm font-medium group-hover:text-primary">
        {person.name}
      </p>
      {person.character && (
        <p className="line-clamp-2 text-xs text-muted-foreground">
          {person.character}
        </p>
      )}
    </>
  );
}
