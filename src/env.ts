import "server-only";
import { z } from "zod";

/**
 * Server-side environment. TMDB is called with a v4 "API Read Access Token"
 * sent as a Bearer header (TMDB's recommended auth).
 */
const schema = z.object({
  TMDB_ACCESS_TOKEN: z
    .string({
      error:
        "Set TMDB_ACCESS_TOKEN (your TMDB API Read Access Token) in .env.local",
    })
    .min(1, "TMDB_ACCESS_TOKEN is empty; paste your TMDB API Read Access Token"),
});

export const env = schema.parse({
  TMDB_ACCESS_TOKEN: process.env.TMDB_ACCESS_TOKEN || undefined,
});
