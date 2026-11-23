/**
 * TMDB/JustWatch give us provider names and logos but no per-service deep
 * links, so we link each provider to its own site. Matching is by name
 * because TMDB has several ids per brand (e.g. "Amazon Prime Video" and
 * "Amazon Prime Video with Ads").
 */
const PROVIDER_SITES: [RegExp, string][] = [
  [/netflix/i, "https://www.netflix.com"],
  [/amazon|prime video/i, "https://www.primevideo.com"],
  [/apple tv/i, "https://tv.apple.com"],
  [/google play/i, "https://play.google.com/store/movies"],
  [/youtube/i, "https://www.youtube.com/movies"],
  [/disney/i, "https://www.disneyplus.com"],
  [/hulu/i, "https://www.hulu.com"],
  [/^max|hbo/i, "https://www.max.com"],
  [/paramount/i, "https://www.paramountplus.com"],
  [/peacock/i, "https://www.peacocktv.com"],
  [/fandango|vudu/i, "https://athome.fandango.com"],
  [/microsoft/i, "https://www.microsoft.com/store/movies-and-tv"],
  [/history vault/i, "https://www.historyvault.com"],
  [/crunchyroll/i, "https://www.crunchyroll.com"],
  [/tubi/i, "https://tubitv.com"],
  [/pluto/i, "https://pluto.tv"],
  [/roku/i, "https://therokuchannel.roku.com"],
  [/plex/i, "https://watch.plex.tv"],
  [/starz/i, "https://www.starz.com"],
  [/mgm/i, "https://www.mgmplus.com"],
  [/amc\+?/i, "https://www.amcplus.com"],
  [/showtime/i, "https://www.sho.com"],
  [/mubi/i, "https://mubi.com"],
  [/criterion/i, "https://www.criterionchannel.com"],
  [/kanopy/i, "https://www.kanopy.com"],
  [/hoopla/i, "https://www.hoopladigital.com"],
  [/shudder/i, "https://www.shudder.com"],
  [/fubo/i, "https://www.fubo.tv"],
  [/sling/i, "https://www.sling.com"],
  [/spectrum/i, "https://ondemand.spectrum.net"],
  [/directv/i, "https://www.directv.com"],
];

/**
 * The provider's own site, or `fallback` (TMDB's "where to watch" page for
 * the movie) when we don't know the service.
 */
export function providerUrl(name: string, fallback: string | null) {
  return (
    PROVIDER_SITES.find(([pattern]) => pattern.test(name))?.[1] ?? fallback
  );
}
