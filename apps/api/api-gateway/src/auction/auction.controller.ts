import { Body, Controller, Get, Inject, Post } from '@nestjs/common';
import { ClientProxy, EventPattern } from '@nestjs/microservices';

import { AuctionGateway } from './auction.gateway';
import { CreateAuctionDto } from './dto/create-auction';

@Controller()
export class AuctionController {
  constructor(
    @Inject() private gateway: AuctionGateway,
    @Inject('NATS_SERVICES') private client: ClientProxy
  ) {}

  @EventPattern('pong')
  auctionPong(): void {
    this.gateway.handleAuctionPong();
  }

  @Post('auction')
  createAuction(@Body() data: CreateAuctionDto) {
    return this.client.send('create-auction', data);
  }

  @Get('auction')
  getAuction(@Body() data: CreateAuctionDto) {
    console.log('room', data);
    return this.client.send('get-auction', data);
  }

  @EventPattern('bid')
  handleBidResponse(data: { amount: number; clientId: string; room: string }) {
    this.gateway.handleBidResponse(data);
  }
}
