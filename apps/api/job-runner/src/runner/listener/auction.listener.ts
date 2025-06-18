import { JobRunnerService } from '../job-runner.service';
import { EventPattern, Payload } from '@nestjs/microservices';
import { AuctionCreatedEvent } from '../types/auction-created-event';
import { Controller } from '@nestjs/common';

@Controller()
export class AuctionListener {
  constructor(private readonly jobRunnerService: JobRunnerService) {}

  @EventPattern('auction.created')
  async auctionCreated(@Payload() data: AuctionCreatedEvent) {
    console.log('Auction created', data);
    const endDate = new Date(
      new Date(data.startDate).getTime() + data.duration * 60 * 1000,
    );

    await this.jobRunnerService.closeAuction(data, endDate);
  }
}
