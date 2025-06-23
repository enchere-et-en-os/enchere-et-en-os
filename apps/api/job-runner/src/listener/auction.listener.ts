import { JobRunnerService } from '../job-runner.service';
import { EventPattern, Payload } from '@nestjs/microservices';
import { AuctionCreatedEvent } from '../types/auction-created-event';
import { Controller } from '@nestjs/common';

@Controller()
export class AuctionListener {
  constructor(private readonly jobRunnerService: JobRunnerService) {}

  @EventPattern('auction.created')
  async auctionCreated(@Payload() data: AuctionCreatedEvent) {
    const startDate = new Date(data.startDate);

    if (isNaN(startDate.getTime())) {
      throw new Error('Invalid Date');
    }

    await this.jobRunnerService.startAuction(data, startDate);
  }
}
