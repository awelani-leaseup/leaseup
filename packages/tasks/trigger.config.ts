import { defineConfig } from '@trigger.dev/sdk';
import { syncVercelEnvVars } from '@trigger.dev/build/extensions/core';
import { prismaExtension } from '@trigger.dev/build/extensions/prisma';
import { BuildExtension } from '@trigger.dev/build';

function prismaFileCopyExtension(): BuildExtension {
  return {
    name: 'prisma-file-copy',
    onBuildComplete: async (context, manifest) => {
      // Add a layer to copy the generated Prisma client files to the expected location
      context.addLayer({
        id: 'prisma-generated-files',
        commands: [
          // Create the generated directory if it doesn't exist
          'mkdir -p /app/generated/client',
          // Copy all Prisma generated files from the default location to our custom location
          'cp -r /app/prisma/generated/client/* /app/generated/client/ || true',
          // Also copy from node_modules if that's where they ended up
          'cp -r /app/node_modules/@prisma/client/* /app/generated/client/ || true',
          // Ensure the binary files have the correct permissions
          'chmod +x /app/generated/client/libquery_engine-*.node || true',
        ],
      });
    },
  };
}

export default defineConfig({
  project: 'proj_jlhisfoufrjnyuppyumz',
  runtime: 'node',
  logLevel: 'log',
  build: {
    extensions: [
      prismaExtension({
        schema: '../prisma/schema.prisma',
        version: '6.5.0',
      }),
      prismaFileCopyExtension(),
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
