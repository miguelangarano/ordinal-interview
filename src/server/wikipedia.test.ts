import { afterEach, describe, expect, it, vi } from "vitest";
import { englishWikipediaUrls } from "./wikipedia";

function mockFetch(response: Response | Error) {
  const fn = vi.fn<typeof fetch>(async () => {
    if (response instanceof Error) throw response;
    return response;
  });
  vi.stubGlobal("fetch", fn);
  return fn;
}

const wikidata = (entities: Record<string, unknown>) =>
  new Response(JSON.stringify({ entities }), { status: 200 });

afterEach(() => vi.unstubAllGlobals());

describe("englishWikipediaUrls", () => {
  it("maps Wikidata ids to English Wikipedia URLs in one request", async () => {
    const fetch = mockFetch(
      wikidata({
        Q1: {
          sitelinks: {
            enwiki: { url: "https://en.wikipedia.org/wiki/Glenn_Close" },
          },
        },
        Q2: { sitelinks: {} }, // no English article
      }),
    );

    const urls = await englishWikipediaUrls(["Q1", "Q2", "Q1"]);

    expect(urls).toEqual({ Q1: "https://en.wikipedia.org/wiki/Glenn_Close" });
    expect(fetch).toHaveBeenCalledTimes(1);
    const url = new URL(String(fetch.mock.calls[0]![0]));
    expect(url.searchParams.get("ids")).toBe("Q1|Q2"); // de-duplicated
  });

  it("drops malformed ids, which would fail the whole batch", async () => {
    const fetch = mockFetch(wikidata({}));
    await englishWikipediaUrls(["Q7", "nm123", "Q", ""]);

    const url = new URL(String(fetch.mock.calls[0]![0]));
    expect(url.searchParams.get("ids")).toBe("Q7");
  });

  it("skips the request entirely when there's nothing to look up", async () => {
    const fetch = mockFetch(wikidata({}));
    expect(await englishWikipediaUrls(["bad"])).toEqual({});
    expect(fetch).not.toHaveBeenCalled();
  });

  it("returns no links instead of failing when Wikidata is down", async () => {
    mockFetch(new Error("network down"));
    expect(await englishWikipediaUrls(["Q1"])).toEqual({});

    mockFetch(new Response("oops", { status: 503 }));
    expect(await englishWikipediaUrls(["Q1"])).toEqual({});
  });
});
