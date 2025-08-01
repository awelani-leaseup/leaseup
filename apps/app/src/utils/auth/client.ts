import { createAuthClient } from "better-auth/react";

const BASE_URL =
  process.env.VERCEL_ENV === "production"
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : process.env.VERCEL_ENV === "preview"
      ? `https://${process.env.VERCEL_URL}`
      : "http://localhost:3001";

export const authClient = createAuthClient({
  baseURL: "http://leaseup.co.za",
  productionUrl: `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL ?? "leaseup.co.za"}`,
});
