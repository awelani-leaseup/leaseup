// This file configures the initialization of Sentry on the client.
// The added config here will be used whenever a users loads a page in their browser.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

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
