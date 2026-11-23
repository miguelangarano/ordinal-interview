import Image from "next/image";
import { providerUrl } from "@/lib/provider-links";
import { regionName } from "@/lib/regions";
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

function ProviderGroup({
  label,
  items,
  fallbackUrl,
}: {
  label: string;
  items: Provider[];
  fallbackUrl: string | null;
}) {
  if (items.length === 0) return null;
  return (
    <div>
      <p className="mb-2 text-xs font-medium tracking-wide text-muted-foreground uppercase">
        {label}
      </p>
      <ul className="flex flex-wrap gap-2">
        {items.map((p) => {
          const logo = tmdbImage(p.logo_path, "w92");
          const href = providerUrl(p.provider_name, fallbackUrl);
          const content = logo ? (
            <Image
              src={logo}
              alt={p.provider_name}
              width={44}
              height={44}
              className="rounded-lg ring-1 ring-white/10 transition group-hover:scale-110 group-hover:ring-primary"
            />
          ) : (
            <span className="text-sm">{p.provider_name}</span>
          );
          return (
            <li key={p.provider_id}>
              {href ? (
                <a
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  title={p.provider_name}
                  aria-label={`${p.provider_name} (opens in a new tab)`}
                  className="group block rounded-lg focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none"
                >
                  {content}
                </a>
              ) : (
                <span title={p.provider_name}>{content}</span>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/** Where to watch in the viewer's region. Data from JustWatch via TMDB. */
export function WatchProviders({
  watch,
  region,
}: {
  watch: Watch | null;
  region: string;
}) {
  const country = regionName(region);
  const hasAny =
    !!watch && watch.stream.length + watch.rent.length + watch.buy.length > 0;

  if (!watch || !hasAny) {
    return (
      <section className="py-6">
        <h2 className="mb-2 text-xl font-semibold tracking-tight">
          Where to watch
        </h2>
        <p className="text-sm text-muted-foreground">
          No streaming, rental or purchase options in {country} yet. Try another
          region from the menu in the header.
        </p>
      </section>
    );
  }

  return (
    <section className="py-6">
      <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-xl font-semibold tracking-tight">Where to watch</h2>
        <p className="text-xs text-muted-foreground">
          Availability in {country}, powered by{" "}
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
        </p>
      </div>
      <div className="flex flex-wrap gap-x-12 gap-y-5 rounded-xl border bg-card/50 p-5">
        <ProviderGroup
          label="Stream"
          items={watch.stream}
          fallbackUrl={watch.link}
        />
        <ProviderGroup
          label="Rent"
          items={watch.rent}
          fallbackUrl={watch.link}
        />
        <ProviderGroup label="Buy" items={watch.buy} fallbackUrl={watch.link} />
      </div>
    </section>
  );
}
