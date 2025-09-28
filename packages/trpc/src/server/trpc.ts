import { initTRPC, TRPCError } from '@trpc/server';
import superjson from 'superjson';
import { ValiError } from 'valibot';
import { supabaseServer } from '../utils/supabase';
import { db } from '@leaseup/prisma/db.ts';
import { auth } from './auth/auth';
import type { Session, User } from 'better-auth';
/**
 * 1. CONTEXT
 *
 * This section defines the "contexts" that are available in the backend API.
 *
 * These allow you to access things when processing a request, like the database, the session, etc.
 *
 * This helper generates the "internals" for a tRPC context. The API handler and RSC clients each
 * wrap this and provides the required context.
    auth: Awaited<ReturnType<typeof auth>>;
 * 
 *
 * @see https://trpc.io/docs/server/context
 */
export const createTRPCContext: (opts: { headers: Headers }) => Promise<
  {
    db: typeof db;
    supabaseServer: typeof supabaseServer;
    auth: { session: Session | undefined; user: User | undefined };
  } & { headers: Headers }
> = async (opts) => {
  const authSession = await auth.api.getSession({
    headers: opts.headers,
  });

  return {
    db,
    supabaseServer,
    auth: {
      session: authSession?.session ?? undefined,
      user: authSession?.user ?? undefined,
    },
    ...opts,
  };
};

/**
 * 2. INITIALIZATION
 *
 * This is where the tRPC API is initialized, connecting the context and transformer. We also parse
 * ZodErrors so that you get typesafety on the frontend if your procedure fails due to validation
 * errors on the backend.
 */
const t = initTRPC.context<typeof createTRPCContext>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        valibotError: error.cause instanceof ValiError ? error.cause : null,
      },
    };
  },
});

/**
 * Create a server-side caller.
 *
 * @see https://trpc.io/docs/server/server-side-calls
 */
export const createCallerFactory = t.createCallerFactory;

/**
 * 3. ROUTER & PROCEDURE (THE IMPORTANT BIT)
 *
 * These are the pieces you use to build your tRPC API. You should import these a lot in the
 * "/src/server/api/routers" directory.
 */

/**
 * This is how you create new routers and sub-routers in your tRPC API.
 *
 * @see https://trpc.io/docs/router
 */
export const createTRPCRouter = t.router;

/**
 * Middleware for timing procedure execution and adding an artificial delay in development.
 *
 * You can remove this if you don't like it, but it can help catch unwanted waterfalls by simulating
 * network latency that would occur in production but not in local development.
 */
const timingMiddleware = t.middleware(async ({ next, path }) => {
  const start = Date.now();

  if (t._config.isDev) {
    // artificial delay in dev
    const waitMs = Math.floor(Math.random() * 400) + 100;
    await new Promise((resolve) => setTimeout(resolve, waitMs));
  }

  const result = await next();

  const end = Date.now();
  console.log(`[TRPC] ${path} took ${end - start}ms to execute`);

  return result;
});

const isAuthed = t.middleware(({ next, ctx }) => {
  if (!ctx.auth?.session?.userId) {
    throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Unauthorized' });
  }

  return next({
    ctx: {
      auth: ctx.auth,
    },
  });
});

export const publicProcedure = t.procedure.use(timingMiddleware);
export const protectedProcedure: typeof t.procedure = t.procedure.use(isAuthed);
