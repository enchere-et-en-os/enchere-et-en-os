import { Controller, Inject } from '@nestjs/common';
import {
  ClientProxy,
  EventPattern,
  MessagePattern,
  Payload,
} from '@nestjs/microservices';

import { AuctionService } from './auction.service';
import { CreateAuctionDto } from './dto/create-auction';

@Controller()
export class AuctionController {
  constructor(
    @Inject('NATS_SERVICES') private client: ClientProxy,
    private auctionService: AuctionService
  ) {}

  @EventPattern('ping')
  sendPong(): void {
    this.client.emit('pong', {});
  }

  @MessagePattern('create-auction')
  createAuction(@Payload() data: CreateAuctionDto) {
    return this.auctionService.createAuction(data);
  }

  @MessagePattern('get-auction')
  getAuction(@Payload() data: CreateAuctionDto) {
    return this.auctionService.getAuction(data);
  }

  @EventPattern('place-bid')
  async placeBid(
    @Payload() data: { amount: number; clientId: string; room: string }
  ) {
    const result = await this.auctionService.placeBid(data);
    this.client.emit('bid', { amount: result.amount, room: result.room });
  }
}
