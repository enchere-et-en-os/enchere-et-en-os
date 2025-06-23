import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Auction } from './auction.entity';
import { CloseAuctionDto } from './dto/close-auction';
import { CreateAuctionDto } from './dto/create-auction';

@Injectable()
export class AuctionService {
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    @Inject('NATS_SERVICES') private readonly natsClient: ClientProxy,
    @InjectRepository(Auction) private readonly auctionRepo: Repository<Auction>
  ) {}

  async createAuction(data: CreateAuctionDto) {
    await this.auctionRepo.save({ ...data, sellerId: data.id });
    this.natsClient.emit('auction.created', data);
    return data;
  }

  async getAuction(data: CreateAuctionDto) {
    const res = await this.cacheManager.get(`key:${data.auctionId}`);
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

  async closeAuction(data: CloseAuctionDto) {
    await this.auctionRepo.save({ ...data, statut: true });
    this.natsClient.emit('ws.close.auction', {
      price: data.finalPrice,
      room: data.auctionId,
    });
  }
}
