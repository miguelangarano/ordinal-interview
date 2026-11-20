# Reel

A movie discovery homepage built on the [TMDB API](https://developer.themoviedb.org/docs/getting-started).

## Features

- **Trending movies** for today or this week. The #1 movie gets a hero banner, and the poster grid loads more as you scroll.
- **Movie details**: backdrop, poster, rating, runtime, genres, tagline, overview, director and writers, top cast, budget and box office, IMDb and official-site links, and recommendations.
- **Trailers** play in a modal with an embedded YouTube player.
- **Where to watch** in the US (stream, rent or buy), via TMDB's JustWatch data.
- **Search** with debounced, shareable URLs (`/search?q=dune`) and infinite results.
- Server-rendered first paint, plus loading skeletons and error and not-found states.

## Stack

Next.js 15 (App Router) · React 19 · TailwindCSS 4 · tRPC 11 + TanStack Query · shadcn/ui (Radix) · zod

## How it fits together

```
src/
  server/tmdb/        server-only TMDB client; responses validated with zod
  server/api/         tRPC router (movies.trending / search / byId / genres)
  trpc/               client provider + RSC helpers (prefetch & hydrate)
  app/                routes: / , /movie/[id] , /search
  components/         UI (shadcn primitives in components/ui)
```

- The TMDB token only exists on the server. The browser talks to `/api/trpc`, never to TMDB directly.
- Server Components prefetch through the tRPC router and hydrate React Query, so the home grid renders on the server and then paginates on the client without a loading flash.
- TMDB responses go through Next's fetch cache (15 min for trending, 1 h for details, 24 h for genres).
- `movies.byId` uses `append_to_response` to fetch details, credits, videos, recommendations and watch providers in one TMDB request, then shapes them into a smaller payload for the UI.

## Running locally

```bash
cp .env.example .env.local   # add TMDB_ACCESS_TOKEN (or TMDB_API_KEY)
pnpm install
pnpm dev
```

Get credentials at https://www.themoviedb.org/settings/api.

## Deploying

On Vercel (or any Node host), set `TMDB_ACCESS_TOKEN` (or `TMDB_API_KEY`) as an environment variable, then build with `pnpm build`.

---

This product uses the TMDB API but is not endorsed or certified by TMDB.
