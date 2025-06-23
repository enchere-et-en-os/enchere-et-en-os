import Redis from 'ioredis';

export const RedisClientProvider = {
  provide: 'REDIS_CLIENT',
  useFactory: () => {
    return new Redis('redis://localhost:6379');
  },
};
