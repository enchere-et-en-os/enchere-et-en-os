import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { Auction } from './auction/auction.entity';
import { AuctionModule } from './auction/auction.module';
import { NatsClientModule } from './nats-client.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: ['../.env.local'],
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DATABASE_HOST,
      port: +process.env.DATABASE_PORT,
      username: process.env.DATABASE_USER,
      password: process.env.DATABASE_PASSWORD,
      database: process.env.DATABASE_NAME,
      entities: [Auction],
      synchronize: true,
    }),
    NatsClientModule,
    AuctionModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
