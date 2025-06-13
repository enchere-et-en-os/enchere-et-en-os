import { CacheModule } from '@nestjs/cache-manager';
import { Module } from '@nestjs/common';
import { NatsClientModule } from 'src/nats-client.module';

import { AuctionController } from './auction.controller';
import { AuctionService } from './auction.service';

@Module({
  imports: [NatsClientModule, CacheModule.register()],
  controllers: [AuctionController],
  providers: [AuctionService],
})
export class AuctionModule {}
