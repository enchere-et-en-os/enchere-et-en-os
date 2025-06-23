import {
  Body,
  Controller,
  Get,
  Inject,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ClientProxy, EventPattern, Payload } from '@nestjs/microservices';
import { TypedRequest } from 'interfaces/keycloak-user.interface';
import { AuthGuard } from 'nest-keycloak-connect';

import { AuctionGateway } from './auction.gateway';
import { CreateAuctionDto } from './dto/create-auction';

@Controller()
@UseGuards(AuthGuard)
export class AuctionController {
  constructor(
    @Inject() private gateway: AuctionGateway,
    @Inject('NATS_SERVICES') private client: ClientProxy
  ) {}

  @Post('auction')
  createAuction(@Body() data: CreateAuctionDto, @Req() req: TypedRequest) {
    return this.client.send('create-auction', { ...data, id: req.user.sub });
  }

  @Get('auction/:id')
  getAuction(@Param() parameters) {
    return this.client.send('get-auction', parameters);
  }

  @EventPattern('bid')
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
