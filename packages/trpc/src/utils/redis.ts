import { createClient } from 'redis';

export const createRedisClient = async (): Promise<
  ReturnType<typeof createClient>
> => {
  return createClient({
    url: process.env.REDIS_STORAGE_REDIS_URL,
  }).connect();
};
