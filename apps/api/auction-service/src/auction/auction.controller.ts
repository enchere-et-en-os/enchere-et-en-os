import { Controller, Inject } from '@nestjs/common';
import {
  ClientProxy,
  EventPattern,
  MessagePattern,
  Payload,
} from '@nestjs/microservices';

import { AuctionService } from './auction.service';
import { CloseAuctionDto } from './dto/close-auction';
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
  async createAuction(@Payload() data: CreateAuctionDto) {
    return this.auctionService.createAuction(data);
  }

  @MessagePattern('get-auction')
  async getAuction(@Payload() data: string) {
    return this.auctionService.getAuction();
  }

  @EventPattern('place-bid')
  async placeBid(
    @Payload() data: { amount: number; auctionId: string; clientId: string }
  ) {
    await this.auctionService.placeBid(data);
    this.client.emit('api-gateway:bid.saved', {
      amount: data.amount,
      clientId: data.clientId,
      room: data.auctionId,
    });
  }

  @EventPattern('auction.close')
  async closeAuction(@Payload() data: CloseAuctionDto) {
    await this.auctionService.closeAuction(data);
  }
}
