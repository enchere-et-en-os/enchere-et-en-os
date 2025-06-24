import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { AuthGuard } from 'nest-keycloak-connect';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuctionModule } from './auction/auction.module';
import { KeycloakModule } from './keycloak.module';
import { NatsClientModule } from './nats-client.module';
import { CategoriesModule } from './products/categories/categories.module';
import { ProductsModule } from './products/products/products.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: ['../.env.local'],
    }),
    KeycloakModule,
    NatsClientModule,
    AuctionModule,
    CategoriesModule,
    ProductsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    { provide: APP_GUARD, useValue: AuthGuard, useClass: AuthGuard },
  ],
})
export class AppModule {}
