import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { PrismaClient } from '@leaseup/prisma/client/index.js';

const prisma = new PrismaClient();

export const auth = betterAuth({
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
    maxPasswordLength: 100,
    minPasswordLength: 8,
    revokeSessionsOnPasswordReset: true,
  },
  database: prismaAdapter(prisma, {
    provider: 'postgresql',
  }),
});
