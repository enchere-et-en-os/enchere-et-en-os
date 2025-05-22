import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuctionGateway } from './auction/auction.gateway';

@Module({
  imports: [],
  controllers: [AppController],
  providers: [AppService, AuctionGateway],
})
export class AppModule {}
