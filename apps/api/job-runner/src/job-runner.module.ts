import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { JobRunnerService } from './job-runner.service';
import { AuctionConsumer } from './consumer/auction.consumer';
import { AuctionListener } from './listener/auction.listener';
import { ClientsModule, Transport } from '@nestjs/microservices';
import * as process from 'node:process';
import { CacheModule } from '@nestjs/cache-manager';

@Module({
  imports: [
    CacheModule.register(),
    BullModule.registerQueue({
      name: 'auctionQueue',
      connection: {
        host: process.env.BULL_HOST,
        port: process.env.BULL_PORT
          ? parseInt(process.env.BULL_PORT, 10)
          : 6379,
      },
    }),
    ClientsModule.register([
      {
        name: 'NATS_SERVICES',
        transport: Transport.NATS,
        options: {
          servers: [process.env.NATS_URL || 'nats://localhost:4222'],
        },
      },
    ]),
  ],
  controllers: [AuctionListener],
  providers: [JobRunnerService, AuctionConsumer, AuctionListener],
})
export class JobRunnerModule {}
