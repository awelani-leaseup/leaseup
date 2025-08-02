import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { PrismaClient } from '@leaseup/prisma/client/index.js';
import { createAuthMiddleware } from 'better-auth/api';
import { novu } from '@leaseup/novu/client.ts';

const BASE_URL =
  process.env.VERCEL_ENV === 'production'
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : process.env.VERCEL_ENV === 'preview'
      ? `https://${process.env.VERCEL_URL}`
      : 'http://localhost:3001';

const prisma = new PrismaClient();

const NOVU_PASSWORD_FORGOT_WORKFLOW_ID = 'landlord-password-forgot';
const NOVU_USER_CREATED_WORKFLOW_ID = 'landlord-welcome-copy';

const NEXT_PUBLIC_GOOGLE_OATH_CLIENT_ID =
  process.env.NEXT_PUBLIC_GOOGLE_OATH_CLIENT_ID;

const GOOGLE_OATH_CLIENT_SECRET = process.env.GOOGLE_OATH_CLIENT_SECRET;

if (!NEXT_PUBLIC_GOOGLE_OATH_CLIENT_ID || !GOOGLE_OATH_CLIENT_SECRET) {
  throw new Error(
    `Missing Google OAuth client ID or secret ${process.env.GOOGLE_OATH_CLIENT_SECRET}`
  );
}

export const auth = betterAuth({
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: BASE_URL,
  productionUrl: BASE_URL,
  socialProviders: {
    google: {
      clientId: NEXT_PUBLIC_GOOGLE_OATH_CLIENT_ID,
      clientSecret: GOOGLE_OATH_CLIENT_SECRET,
    },
  },
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
    maxPasswordLength: 100,
    minPasswordLength: 8,
    revokeSessionsOnPasswordReset: true,
    sendResetPassword: async ({ user, url }, request) => {
      await novu.trigger({
        to: {
          subscriberId: user.id,
          email: user.email,
        },
        workflowId: NOVU_PASSWORD_FORGOT_WORKFLOW_ID,
        payload: {
          redirectLink: url,
        },
      });
    },
  },
  hooks: {
    after: createAuthMiddleware(async (ctx) => {
      // if (ctx.context.session?.user.onboardingCompleted) {
      //   ctx.redirect('/onboarding');
      // }
    }),
  },
  databaseHooks: {
    user: {
      create: {
        after: async (user, _ctx) => {
          await novu.trigger({
            to: {
              subscriberId: user.id,
              email: user.email,
            },
            workflowId: NOVU_USER_CREATED_WORKFLOW_ID,
            payload: {
              fullName: user.name,
            },
          });
          _ctx?.redirect('/onboarding');
        },
      },
    },
  },
  database: prismaAdapter(prisma, {
    provider: 'postgresql',
  }),
});
