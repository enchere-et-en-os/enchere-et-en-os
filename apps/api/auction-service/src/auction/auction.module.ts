import { CacheModule } from '@nestjs/cache-manager';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as redisStore from 'cache-manager-ioredis';
import { NatsClientModule } from 'src/nats-client.module';

import { AuctionController } from './auction.controller';
import { Auction } from './auction.entity';
import { AuctionService } from './auction.service';
import { RedisClientProvider } from './redis.provider';

@Module({
  imports: [
    NatsClientModule,
    CacheModule.register({
      store: redisStore,
      url: 'redis://localhost:6379',
      ttl: 60,
    }),
    TypeOrmModule.forFeature([Auction]),
  ],
  controllers: [AuctionController],
  providers: [RedisClientProvider, AuctionService],
})
export class AuctionModule {}
