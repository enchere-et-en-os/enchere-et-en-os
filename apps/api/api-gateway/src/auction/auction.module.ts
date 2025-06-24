import { CacheModule } from '@nestjs/cache-manager';
import { Module } from '@nestjs/common';
import { KeycloakModule } from 'src/keycloak.module';
import { NatsClientModule } from 'src/nats-client.module';

import { AuctionController } from './auction.controller';
import { AuctionGateway } from './auction.gateway';

@Module({
  imports: [KeycloakModule, NatsClientModule, CacheModule.register()],
  controllers: [AuctionController],
  providers: [AuctionGateway],
})
export class AuctionModule {}
