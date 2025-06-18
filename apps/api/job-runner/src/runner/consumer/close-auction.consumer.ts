import { Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { AuctionCreatedEvent } from '../types/auction-created-event';
import { lastValueFrom } from 'rxjs';

@Processor('auctionQueue')
export class CloseAuctionConsumer extends WorkerHost {
  constructor(
    @Inject('NATS_SERVICES') private readonly auctionClient: ClientProxy,
  ) {
    super();
  }

  override async process(job: Job<AuctionCreatedEvent>): Promise<void> {
    console.log('Closing auction queue');
    await lastValueFrom(this.auctionClient.emit('auction.close', { job }));
  }
}
