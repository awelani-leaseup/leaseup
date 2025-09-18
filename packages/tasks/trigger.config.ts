import { defineConfig } from '@trigger.dev/sdk/v3';
import { prismaExtension } from '@trigger.dev/build/extensions/prisma';
import {
  syncVercelEnvVars,
  additionalFiles,
} from '@trigger.dev/build/extensions/core';

export default defineConfig({
  project: 'proj_jlhisfoufrjnyuppyumz',
  runtime: 'node',
  logLevel: 'log',
  build: {
    extensions: [
      prismaExtension({
        schema: '../prisma/schema.prisma',
        clientGenerator: 'client',
        version: '6.9.0',
        migrate: false,
      }),
      additionalFiles({
        files: ['../prisma/generated/client/*'],
      }),
      syncVercelEnvVars({
        vercelAccessToken: process.env.VERCEL_ACCESS_TOKEN,
        projectId: process.env.VERCEL_PROJECT_ID,
        vercelTeamId: process.env.VERCEL_TEAM_ID,
      }),
    ],
    external: ['@prisma/client'],
  },
  maxDuration: 3600,
  retries: {
    enabledInDev: true,
    default: {
      maxAttempts: 3,
      minTimeoutInMs: 1000,
      maxTimeoutInMs: 10000,
      factor: 2,
      randomize: true,
    },
  },
  dirs: ['./src/trigger'],
});
