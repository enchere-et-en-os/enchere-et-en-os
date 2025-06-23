import { Inject } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';

import { AuctionGateway } from './auction.gateway';

export class AuctionController {
  constructor(@Inject() private gateway: AuctionGateway) {}

  @EventPattern('api-gateway:bid.saved')
  handleBidResponse(
    @Payload() data: { amount: number; clientId: string; room: string }
  ) {
    this.gateway.handleBidResponse(data);
  }

  @EventPattern('ws.close.auction')
  closeAuction(@Payload() data: { finalPrice: number; roomId: string }) {
    this.gateway.closeRoom(data.finalPrice, data.roomId);
  }
}
