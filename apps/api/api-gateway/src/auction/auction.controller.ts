import { Controller, Inject } from '@nestjs/common';
import { EventPattern } from '@nestjs/microservices';

import { AuctionGateway } from './auction.gateway';

@Controller()
export class AuctionController {
  constructor(@Inject() private gateway: AuctionGateway) {}

  @EventPattern('pong')
  auctionPong(): void {
    this.gateway.handleAuctionPong();
  }
}
