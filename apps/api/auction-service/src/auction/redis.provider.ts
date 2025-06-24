import Redis from 'ioredis';

export const RedisClientProvider = {
  provide: 'REDIS_CLIENT',
  useFactory: () => {
    return new Redis(process.env.REDIS_HOST ?? 'redis://localhost:6379');
  },
};
