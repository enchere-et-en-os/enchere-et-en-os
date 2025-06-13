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
      authServerUrl: process.env.KC_HOST,
      realm: process.env.KC_REALM,
      clientId: process.env.KC_CLIENT_ID,
      secret: process.env.KC_CLIENT_SECRET,
      policyEnforcement: PolicyEnforcementMode.PERMISSIVE, // optional
      tokenValidation: TokenValidation.ONLINE, // optional
    }),
  ],
  controllers: [AppController],
  providers: [AppService, { provide: APP_GUARD, useValue: AuthGuard }],
})
export class AppModule {}
