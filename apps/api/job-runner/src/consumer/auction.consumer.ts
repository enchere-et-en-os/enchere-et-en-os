import { Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { AuctionCreatedEvent } from '../types/auction-created-event';
import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';
import { JobRunnerService } from '../job-runner.service';

type StartAuctionJob = Job<AuctionCreatedEvent> & { name: 'start.auction' };
type CloseAuctionJob = Job<string> & { name: 'close.auction' };

export type AuctionJob = StartAuctionJob | CloseAuctionJob;

@Processor('auctionQueue')
export class AuctionConsumer extends WorkerHost {
  constructor(
    @Inject('NATS_SERVICES') private readonly auctionClient: ClientProxy,
    @Inject(CACHE_MANAGER) private readonly cache: Cache,
    public jobRunnerService: JobRunnerService,
  ) {
    super();
  }

  override async process(job: AuctionJob): Promise<void> {
    switch (job.name) {
      case 'start.auction': {
        const { auctionId, duration } = job.data;

        const dataRoom = {
          ...job.data,
          endDate: new Date(
            new Date(job.data.startDate).getTime() + job.data.duration,
          ),
          bids: [
            {
              userId: job.data.userId,
              price: job.data.startPrice,
            },
          ],
        };

        await this.cache.set(`auction:${auctionId}:room`, dataRoom, 0);

        await this.jobRunnerService.closeAuction(
          `auction:${auctionId}:room`,
          duration,
        );
        break;
      }
      case 'close.auction': {
        await this.cache.get(job.data);

        await this.cache.del(job.data);
        this.auctionClient.emit('auction.close', { job });
        break;
      }
      default: {
        break;
      }
    }
  }
}
