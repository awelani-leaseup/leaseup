import { PrismaClient } from '../generated/client/client.js';

const createPrismaClient = () =>
  new PrismaClient({
    log:
      (globalThis as any).process?.env?.NODE_ENV === 'development'
        ? ['query', 'error', 'warn']
        : ['error'],
  });

const globalForPrisma = globalThis as unknown as {
  prisma: ReturnType<typeof createPrismaClient> | undefined;
};

export const db = globalForPrisma.prisma ?? createPrismaClient();

if ((globalThis as any).process?.env?.NODE_ENV !== 'production')
  globalForPrisma.prisma = db;
