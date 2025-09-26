import * as Sentry from "@sentry/nextjs";
import posthog from "posthog-js";

posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
  api_host: "/ingest",
  ui_host: "https://eu.posthog.com",
  defaults: "2025-05-24",
  capture_exceptions: true,
  debug: process.env.NODE_ENV === "development",
});

Sentry.init({
  dsn: "https://09993702abc3a152668b07da32127287@o4510074466664448.ingest.de.sentry.io/4510074468302928",

  integrations: [
    Sentry.replayIntegration({
      maskAllText: false,
    }),
  ],

  tracesSampleRate: 1,

  enableLogs: true,

  replaysSessionSampleRate: 0.1,

  replaysOnErrorSampleRate: 1.0,

  debug: false,
});

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
