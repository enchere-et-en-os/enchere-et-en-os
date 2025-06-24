import { Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { AuctionCreatedEvent } from '../types/auction-created-event';
import { JobRunnerService } from '../job-runner.service';
import Redis from 'ioredis';

type StartAuctionJob = Job<{ data: AuctionCreatedEvent }> & {
  name: 'start.auction';
};
type CloseAuctionJob = Job<string> & { name: 'close.auction' };

export type AuctionJob = StartAuctionJob | CloseAuctionJob;

@Processor('auctionQueue')
export class AuctionConsumer extends WorkerHost {
  constructor(
    @Inject('REDIS_CLIENT') private readonly redis: Redis,
    @Inject('NATS_SERVICES') private readonly auctionClient: ClientProxy,
    public jobRunnerService: JobRunnerService,
  ) {
    super();
  }

  override async process(job: AuctionJob): Promise<void> {
    switch (job.name) {
      case 'start.auction': {
        const { id, duration } = job.data.data;

        const dataRoom = {
          ...job.data,
          endDate: new Date(
            new Date(job.data.data.startDate).getTime() +
              job.data.data.duration,
          ),
          bids: [
            {
              userId: job.data.data.userId,
              price: job.data.data.startPrice,
            },
          ],
        };

        await this.redis.set(`auction:${id}:room`, JSON.stringify(dataRoom));

        await this.jobRunnerService.closeAuction(
          `auction:${id}:room`,
          duration,
        );

        break;
      }
      case 'close.auction': {
        await this.redis.get(job.data);

        await this.redis.del(job.data);
        this.auctionClient.emit('auction.close', { job });
        break;
      }
      default: {
        break;
      }
    }
  }
}
