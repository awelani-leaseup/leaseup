import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { novu } from '@leaseup/novu/client.ts';
import { db as prisma } from '@leaseup/prisma/db.ts';
import { createAuthMiddleware } from 'better-auth/api';

let BASE_URL = 'http://localhost:3001';

if (process.env.VERCEL_ENV === 'production') {
  BASE_URL = `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
} else if (process.env.VERCEL_ENV === 'preview') {
  BASE_URL = `https://${process.env.VERCEL_URL}`;
}

const NOVU_PASSWORD_FORGOT_WORKFLOW_ID = 'landlord-password-forgot';

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
  user: {
    deleteUser: {
      enabled: true,
      beforeDelete: async (user, request) => {
        // Log the deletion attempt for audit purposes
        console.log(`User deletion initiated for: ${user.email}`);
      },
      afterDelete: async (user, request) => {
        // Log successful deletion
        console.log(`User successfully deleted: ${user.email}`);
      },
    },
  },
  hooks: {
    after: createAuthMiddleware(async (ctx) => {
      ctx.redirect('/onboarding');
    }),
  },
  database: prismaAdapter(prisma, {
    provider: 'postgresql',
  }),
});
