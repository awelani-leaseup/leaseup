import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { NextResponse, type NextRequest } from "next/server";

import { appRouter } from "@leaseup/trpc/server";
import { createTRPCContext } from "@leaseup/trpc/trpc";

const createContext = async (req: NextRequest) => {
  return createTRPCContext({
    headers: req.headers,
  });
};

const handler = (req: NextRequest) =>
  fetchRequestHandler({
    endpoint: "/api/trpc",
    req,
    router: appRouter,
    createContext: () => createContext(req),
    onError: ({ error, path }) => {
      if (error.code === "UNAUTHORIZED") {
        return NextResponse.redirect(new URL("/sign-in", req.url));
      }
      if (process.env.NODE_ENV === "development") {
        console.error(
          `❌ tRPC failed on ${path ?? "<no-path>"}: ${error.message}`,
        );
      }
    },
  });

export { handler as GET, handler as POST };
