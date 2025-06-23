import { Module } from '@nestjs/common';
import {
  KeycloakConnectModule,
  PolicyEnforcementMode,
  TokenValidation,
} from 'nest-keycloak-connect';

@Module({
  imports: [
    KeycloakConnectModule.register({
      authServerUrl: 'http://localhost:8080',
      realm: 'enchere',
      clientId: 'front',
      secret: 'unused',
      policyEnforcement: PolicyEnforcementMode.PERMISSIVE,
      tokenValidation: TokenValidation.OFFLINE,
    }),
  ],
  exports: [KeycloakConnectModule],
})
export class KeycloakModule {}
