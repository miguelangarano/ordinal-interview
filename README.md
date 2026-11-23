# Reel

A movie discovery homepage built on the [TMDB API](https://developer.themoviedb.org/docs/getting-started).

## Features

- **Home rows**: today's #1 movie gets a hero banner. Below it come carousels for Trending, Popular, and the five hottest categories. Each row pages left and right in groups and loads 10 more as you reach the end.
- **Categories**: the header shows the five genres most common in this week's trending movies, plus a **More** menu with the rest. A category page lists the top 50 movies and loads more as you scroll.
- **Upcoming**: a month-by-month release calendar showing every day of the month. Clicking a day bursts its movies out of the cell into a grid.
- **Movie details**: backdrop, rating, runtime, genres, credits, release info, trailer modal, cast with Wikipedia links, where to watch in the US (linked to each service), and recommendations.
- **Search**: debounced and shareable (`/search?q=dune`), shows the top 50 results with more as you scroll, and returns home when you clear it.
- Server-rendered first paint, plus loading skeletons and error and not-found states.

## Stack

Next.js 15 (App Router) · React 19 · TailwindCSS 4 · tRPC 11 + TanStack Query · shadcn/ui (Radix) · Motion · zod

## How it fits together

```
src/
  server/tmdb/        server-only TMDB client; responses validated with zod
  server/api/         tRPC router (movies.list / topGenres / upcoming / byId / …)
  trpc/               client provider + RSC helpers (prefetch & hydrate)
  app/                routes: / , /movie/[id] , /search , /category/[id] , /upcoming
  components/         UI (shadcn primitives in components/ui)
```

- The TMDB token only exists on the server. The browser talks to `/api/trpc`, never to TMDB directly.
- Server Components prefetch through the tRPC router and hydrate React Query, so the home grid renders on the server and then paginates on the client without a loading flash.
- TMDB responses go through Next's fetch cache (15 min for trending, 1 h for details, 24 h for genres). Images load straight from TMDB's CDN, which already serves them at the requested size.
- `movies.list` serves any window (offset + limit) over trending, popular, genre or search results by stitching TMDB's fixed 20-item pages together. That's how carousels load 10 at a time and grids load 50.
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
