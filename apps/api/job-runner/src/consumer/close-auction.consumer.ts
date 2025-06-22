import { Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { AuctionCreatedEvent } from '../types/auction-created-event';
import { lastValueFrom } from 'rxjs';
import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';

@Processor('auctionQueue')
export class CloseAuctionConsumer extends WorkerHost {
  constructor(
    @Inject('NATS_SERVICES') private readonly auctionClient: ClientProxy,
    @Inject(CACHE_MANAGER) private readonly cache: Cache,
  ) {
    super();
  }

  override async process(job: Job<AuctionCreatedEvent>): Promise<void> {
    const { auctionId } = job.data;
    await this.cache.del(`auction:${auctionId}:room`);
    await lastValueFrom(this.auctionClient.emit('auction.close', { job }));
  }
}
