import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { AuctionCreatedEvent } from './types/auction-created-event';

@Injectable()
export class JobRunnerService {
  constructor(@InjectQueue('auctionQueue') private auctionQueue: Queue) {}

  async startAuction(data: AuctionCreatedEvent, startDate: Date) {
    const delay = startDate.getTime() - Date.now();
    await this.auctionQueue.add('start.auction', { data }, { delay });
  }

  async closeAuction(data: string, duration: number) {
    await this.auctionQueue.add('close.auction', { data }, { delay: duration });
  }
}
