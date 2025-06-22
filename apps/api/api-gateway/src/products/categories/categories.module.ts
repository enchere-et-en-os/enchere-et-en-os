import { Module } from '@nestjs/common';

import { NatsClientModule } from '../../nats-client.module';
import { CategoriesController } from './categories.controller';

@Module({
  imports: [NatsClientModule],
  controllers: [CategoriesController],
})
export class CategoriesModule {}
