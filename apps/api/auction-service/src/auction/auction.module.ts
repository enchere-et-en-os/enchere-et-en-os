import { CacheModule } from '@nestjs/cache-manager';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NatsClientModule } from 'src/nats-client.module';

import { AuctionController } from './auction.controller';
import { Auction } from './auction.entity';
import { AuctionService } from './auction.service';

@Module({
  imports: [
    NatsClientModule,
    CacheModule.register(),
    TypeOrmModule.forFeature([Auction]),
  ],
  controllers: [AuctionController],
  providers: [AuctionService],
})
export class AuctionModule {}
