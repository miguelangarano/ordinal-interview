import Image from "next/image";
import { tmdbImage } from "@/lib/tmdb-image";

type Provider = {
  provider_id: number;
  provider_name: string;
  logo_path: string | null;
};

type Watch = {
  link: string | null;
  stream: Provider[];
  rent: Provider[];
  buy: Provider[];
};

function ProviderGroup({ label, items }: { label: string; items: Provider[] }) {
  if (items.length === 0) return null;
  return (
    <div>
      <p className="mb-2 text-xs font-medium tracking-wide text-muted-foreground uppercase">
        {label}
      </p>
      <ul className="flex flex-wrap gap-2">
        {items.map((p) => {
          const logo = tmdbImage(p.logo_path, "w92");
          return (
            <li key={p.provider_id} title={p.provider_name}>
              {logo ? (
                <Image
                  src={logo}
                  alt={p.provider_name}
                  width={40}
                  height={40}
                  className="rounded-lg ring-1 ring-white/10"
                />
              ) : (
                <span className="text-sm">{p.provider_name}</span>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/** Where to watch in the US. Data provided by JustWatch via TMDB. */
export function WatchProviders({ watch }: { watch: Watch | null }) {
  if (
    !watch ||
    watch.stream.length + watch.rent.length + watch.buy.length === 0
  ) {
    return null;
  }

  return (
    <div className="space-y-4 rounded-xl border bg-card/50 p-5">
      <h2 className="font-semibold">Where to watch</h2>
      <ProviderGroup label="Stream" items={watch.stream} />
      <ProviderGroup label="Rent" items={watch.rent} />
      <ProviderGroup label="Buy" items={watch.buy} />
      <p className="text-xs text-muted-foreground">
        US availability, powered by{" "}
        {watch.link ? (
          <a
            href={watch.link}
            target="_blank"
            rel="noreferrer"
            className="underline underline-offset-4 hover:text-foreground"
          >
            JustWatch
          </a>
        ) : (
          "JustWatch"
        )}
        .
      </p>
    </div>
  );
}
