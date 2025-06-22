import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ClientsModule, Transport } from '@nestjs/microservices';
import {
  AuthGuard,
  KeycloakConnectModule,
  PolicyEnforcementMode,
  TokenValidation,
} from 'nest-keycloak-connect';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CategoriesModule } from './products/categories/categories.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: ['../.env.local'],
    }),
    ClientsModule.register([
      {
        name: 'NATS_SERVICES',
        transport: Transport.NATS,
        options: {
          servers: [process.env.NATS_URL ?? 'nats://localhost:4222'],
        },
      },
    ]),
    KeycloakConnectModule.register({
      authServerUrl: 'http://localhost:8080', // might be http://localhost:8080/auth for older keycloak versions
      realm: 'enchere',
      clientId: 'front',
      secret: 'uHyTIrI3y2c2UtuN09zrI7mzJSzfLJRH',
      policyEnforcement: PolicyEnforcementMode.PERMISSIVE, // optional
      tokenValidation: TokenValidation.ONLINE, // optional
    }),
    CategoriesModule,
  ],
  controllers: [AppController],
  providers: [AppService, { provide: APP_GUARD, useValue: AuthGuard }],
})
export class AppModule {}
