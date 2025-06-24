import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { InjectRepository } from '@nestjs/typeorm';
import Redis from 'ioredis';
import { Repository } from 'typeorm';

import { Auction } from './auction.entity';
import { CloseAuctionDto } from './dto/close-auction';
import { CreateAuctionDto } from './dto/create-auction';

type Bid = {
  clientId: string;
  price: number;
};

type AuctionRoom = {
  auctionId: string;
  bids: Bid[];
  duration: number;
  endDate: string;
  startDate: string;
  startPrice: number;
  userId: string;
};

@Injectable()
export class AuctionService {
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    @Inject('REDIS_CLIENT') private readonly redis: Redis,
    @Inject('NATS_SERVICES') private readonly natsClient: ClientProxy,
    @InjectRepository(Auction) private readonly auctionRepo: Repository<Auction>
  ) {}

  async createAuction(data: CreateAuctionDto) {
    const res = await this.auctionRepo.save({ ...data, sellerId: data.id });
    this.natsClient.emit('auction.created', data);
    return res;
  }

  async getAuction() {
    return this.redis.keys('auction:*:room');
  }

  async placeBid(data: {
    amount: number;
    auctionId: string;
    clientId: string;
  }) {
    const { auctionId, clientId, amount } = data;

    // Récupère l'objet complet dans Redis
    const roomKey = `auction:${auctionId}:room`;
    const room = (await this.cacheManager.get(roomKey)) as AuctionRoom;

    if (!room) {
      throw new Error(`Room ${roomKey} not found`);
    }

    // Vérifie si l'amount est supérieur à tous les prix existants
    const isHigher = room.bids.every((bid) => amount > bid.price);

    if (!isHigher) {
      throw new Error(`Bid of ${amount} is not higher than existing bids`);
    }

    // Ajoute le nouveau bid
    room.bids.push({ clientId, price: amount });

    // Mets à jour Redis
    await this.cacheManager.set(roomKey, room, 0);

    // Optionnel : retourner le room ou juste les bids
    return room;
  }

  async closeAuction(data: CloseAuctionDto) {
    await this.auctionRepo.save({ ...data, statut: true });
    this.natsClient.emit('ws.close.auction', {
      price: data.finalPrice,
      room: data.auctionId,
    });
  }
}
