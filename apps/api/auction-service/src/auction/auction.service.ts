import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';

import { CreateAuctionDto } from './dto/create-auction';

@Injectable()
export class AuctionService {
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    @Inject('NATS_SERVICES') private readonly natsClient: ClientProxy
  ) {}

  async createAuction(data: CreateAuctionDto) {
    await this.cacheManager.set(`key:${data.auctionId}`, data, 0);
    console.log('Create Auction');
    this.natsClient.emit('auction.created', data);
    console.log(`Auction created for ${data.auctionId}`);

    return data;
  }

  async getAuction(data: CreateAuctionDto) {
    const res = await this.cacheManager.get(`key:${data.auctionId}`);
    console.log(res);
    return res;
  }

  async placeBid(data: { amount: number; clientId: string; room: string }) {
    const { room } = data;
    await this.cacheManager.set(`bid:${room}`, data, 0);
    return data;
  }

  async getBid(room: string) {
    const res = await this.cacheManager.get(`bid:${room}`);
    return res;
  }

  async closeAuction() {
    console.log('auction closed');
  }
}
