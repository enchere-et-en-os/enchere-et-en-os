import { JobRunnerService } from '../job-runner.service';
import { EventPattern, Payload } from '@nestjs/microservices';
import { AuctionCreatedEvent } from '../types/auction-created-event';
import { Controller, Inject } from '@nestjs/common';
import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';

@Controller()
export class AuctionListener {
  constructor(
    private readonly jobRunnerService: JobRunnerService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  @EventPattern('auction.created')
  async auctionCreated(@Payload() data: AuctionCreatedEvent) {
    const endDate = new Date(
      new Date(data.startDate).getTime() + data.duration * 60 * 1000,
    );

    const roomId = `room:${data.auctionId}:${Date.now()}`;
    await this.cacheManager.set(`auction:${data.auctionId}:room`, roomId, 0);

    await this.jobRunnerService.closeAuction(data, endDate);
  }
}
