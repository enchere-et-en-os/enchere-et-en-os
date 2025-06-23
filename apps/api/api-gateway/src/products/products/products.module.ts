import { Module } from '@nestjs/common';

import { KeycloakModule } from '../../keycloak.module';
import { NatsClientModule } from '../../nats-client.module';
import { ProductController } from './products.controller';

@Module({
  imports: [KeycloakModule, NatsClientModule],
  controllers: [ProductController],
})
export class ProductsModule {}
