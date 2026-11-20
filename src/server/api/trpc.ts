import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import { ZodError } from "zod";
import { TmdbError } from "@/server/tmdb/client";

export const createTRPCContext = async (opts: { headers: Headers }) => {
  return { ...opts };
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
