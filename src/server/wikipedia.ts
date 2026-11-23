import "server-only";
import { z } from "zod";

const responseSchema = z.object({
  entities: z
    .record(
      z.string(),
      z.object({
        sitelinks: z
          .object({ enwiki: z.object({ url: z.string().url() }).optional() })
          .optional(),
      }),
    )
    .default({}),
});

// Wikidata's limit for wbgetentities is 50 ids per request.
const MAX_IDS = 50;
const QID = /^Q\d+$/;

/**
 * Resolves Wikidata ids (e.g. "Q19877770") to English Wikipedia URLs in a
 * single request. Best-effort: ids without an English article are omitted,
 * and any failure resolves to an empty map so callers can simply skip links.
 */
export async function englishWikipediaUrls(
  wikidataIds: string[],
): Promise<Record<string, string>> {
  // Wikidata rejects the whole batch if a single id is malformed.
  const ids = [...new Set(wikidataIds.filter((id) => QID.test(id)))].slice(
    0,
    MAX_IDS,
  );
  if (ids.length === 0) return {};

  const url = new URL("https://www.wikidata.org/w/api.php");
  url.search = new URLSearchParams({
    action: "wbgetentities",
    ids: ids.join("|"),
    props: "sitelinks/urls",
    sitefilter: "enwiki",
    format: "json",
  }).toString();

  try {
    const res = await fetch(url, {
      // Wikimedia asks API clients to identify themselves.
      headers: { "User-Agent": "Reel-movie-demo/1.0", accept: "application/json" },
      next: { revalidate: 60 * 60 * 24 * 7 },
      signal: AbortSignal.timeout(4000),
    });
    if (!res.ok) return {};
    const { entities } = responseSchema.parse(await res.json());

    const urls: Record<string, string> = {};
    for (const [qid, entity] of Object.entries(entities)) {
      const link = entity.sitelinks?.enwiki?.url;
      if (link) urls[qid] = link;
    }
    return urls;
  } catch {
    return {};
  }
}
