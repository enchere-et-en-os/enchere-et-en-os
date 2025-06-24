import {
  Body,
  Controller,
  Get,
  Inject,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { TypedRequest } from 'interfaces/keycloak-user.interface';
import { AuthGuard } from 'nest-keycloak-connect';

import { CreateAuctionDto } from './dto/create-auction';

@Controller()
@UseGuards(AuthGuard)
export class AuctionController {
  constructor(@Inject('NATS_SERVICES') private client: ClientProxy) {}

  @Post('auction')
  createAuction(@Body() data: CreateAuctionDto, @Req() req: TypedRequest) {
    return this.client.send('create-auction', { ...data, id: req.user.sub });
  }

  @Get('auction')
  getAuction() {
    return this.client.send('get-auction', '');
  }
}
