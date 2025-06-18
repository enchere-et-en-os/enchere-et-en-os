import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { JobRunnerService } from './job-runner.service';
import { CloseAuctionConsumer } from './consumer/close-auction.consumer';
import { AuctionListener } from './listener/auction.listener';
import { ClientsModule, Transport } from '@nestjs/microservices';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'auctionQueue',
      connection: {
        host: 'localhost',
        port: 6379,
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
  providers: [JobRunnerService, CloseAuctionConsumer, AuctionListener],
})
export class RunnerModule {}
