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
      secret: 'uHyTIrI3y2c2UtuN09zrI7mzJSzfLJRH',
      policyEnforcement: PolicyEnforcementMode.PERMISSIVE,
      tokenValidation: TokenValidation.ONLINE,
    }),
  ],
  exports: [KeycloakConnectModule],
})
export class KeycloakModule {}
