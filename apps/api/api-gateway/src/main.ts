import {Logger} from "@nestjs/common";
import {NestFactory} from '@nestjs/core';
import {Transport} from "@nestjs/microservices";

import {AppModule} from './app.module';

const logger = new Logger();

/**
 *
 */
async function bootstrap() {
  const app = await NestFactory.createMicroservice(AppModule, {
    transport: Transport.NATS,
    options: {
      servers: ['nats://localhost:4222'],
    },
  });
  app.listen().then(() => logger.log("API Gateway is listening")).catch(() => logger.error("API Gateway is not listening"));
}

void bootstrap();
