import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuctionGateway } from './auction/auction.gateway';

@Module({
  imports: [ConfigModule.forRoot({
    envFilePath: ['.env.dev', '.env'],
  })],
  controllers: [AppController],
  providers: [AppService, AuctionGateway],
})
export class AppModule {}
