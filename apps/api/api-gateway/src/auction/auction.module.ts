import { Module } from '@nestjs/common';
import { NatsClientModule } from 'src/nats-client.module';

import { AuctionController } from './auction.controller';
import { AuctionGateway } from './auction.gateway';

@Module({
  imports: [NatsClientModule],
  controllers: [AuctionController],
  providers: [AuctionGateway],
})
export class AuctionModule {}
