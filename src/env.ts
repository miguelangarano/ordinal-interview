import "server-only";
import { z } from "zod";

/**
 * Server-side environment. TMDB accepts either a v4 "Read Access Token"
 * (sent as a Bearer header) or a v3 API key (sent as a query param).
 * At least one is required.
 */
const schema = z
  .object({
    TMDB_ACCESS_TOKEN: z.string().min(1).optional(),
    TMDB_API_KEY: z.string().min(1).optional(),
  })
  .refine((env) => env.TMDB_ACCESS_TOKEN || env.TMDB_API_KEY, {
    message: "Set TMDB_ACCESS_TOKEN or TMDB_API_KEY in your environment",
  });

export const env = schema.parse({
  TMDB_ACCESS_TOKEN: process.env.TMDB_ACCESS_TOKEN || undefined,
  TMDB_API_KEY: process.env.TMDB_API_KEY || undefined,
});
