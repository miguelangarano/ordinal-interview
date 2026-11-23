import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import { ZodError } from "zod";
import { readCookie, REGION_COOKIE, resolveRegion } from "@/lib/regions";
import { TmdbError } from "@/server/tmdb/client";

export const createTRPCContext = async (opts: { headers: Headers }) => {
  const region = resolveRegion({
    cookie: readCookie(opts.headers.get("cookie"), REGION_COOKIE),
    // Set by Vercel on every request; absent locally.
    ipCountry: opts.headers.get("x-vercel-ip-country"),
  });
  return { ...opts, region };
};

const t = initTRPC.context<typeof createTRPCContext>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError: error.cause instanceof ZodError ? error.cause.issues : null,
      },
    };
  },
});

/** Map upstream TMDB failures onto meaningful tRPC error codes. */
const tmdbErrors = t.middleware(async ({ next }) => {
  const result = await next();
  if (!result.ok && result.error.cause instanceof TmdbError) {
    const { status } = result.error.cause;
    throw new TRPCError({
      code:
        status === 404
          ? "NOT_FOUND"
          : status === 429
            ? "TOO_MANY_REQUESTS"
            : "INTERNAL_SERVER_ERROR",
      message: result.error.cause.message,
      cause: result.error.cause,
    });
  }
  return result;
});

export const createCallerFactory = t.createCallerFactory;
export const createTRPCRouter = t.router;
export const publicProcedure = t.procedure.use(tmdbErrors);
