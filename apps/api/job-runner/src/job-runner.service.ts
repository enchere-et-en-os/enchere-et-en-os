import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { AuctionCreatedEvent } from './types/auction-created-event';

@Injectable()
export class JobRunnerService {
  constructor(@InjectQueue('auctionQueue') private auctionQueue: Queue) {}

  async closeAuction(data: AuctionCreatedEvent, endDate: Date) {
    console.log('Closing auction queue service');
    const delay = endDate.getTime() - Date.now();

    await this.auctionQueue.add('close.auction', { data }, { delay });
  }
}
