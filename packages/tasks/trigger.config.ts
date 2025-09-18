import { defineConfig } from '@trigger.dev/sdk';
import { syncVercelEnvVars } from '@trigger.dev/build/extensions/core';
import { prismaExtension } from '@trigger.dev/build/extensions/prisma';

export default defineConfig({
  project: 'proj_jlhisfoufrjnyuppyumz',
  runtime: 'node',
  logLevel: 'log',
  build: {
    extensions: [
      prismaExtension({
        schema: '../prisma/schema.prisma',
        version: '6.9.0',
        // clientGenerator: 'triggerClient',
      }),
      syncVercelEnvVars({
        vercelAccessToken: process.env.VERCEL_ACCESS_TOKEN,
        projectId: process.env.VERCEL_PROJECT_ID,
        vercelTeamId: process.env.VERCEL_TEAM_ID,
      }),
    ],
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
