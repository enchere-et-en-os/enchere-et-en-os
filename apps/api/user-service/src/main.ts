import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { Transport } from '@nestjs/microservices';

import { AppModule } from './app.module';

const logger = new Logger();

/**
 *
 */
async function bootstrap() {
  const app = await NestFactory.createMicroservice(AppModule, {
    transport: Transport.NATS,
    options: {
      servers: [process.env.NATS_URL ?? 'nats://localhost:4222'],
    },
  });
  app.useGlobalPipes(new ValidationPipe());
  app
    .listen()
    .then(() => logger.log('Microservice User is listening'))
    .catch((error) =>
      logger.error('Microservice User is not listening ', error, 'Bootstrap')
    );
}

void bootstrap();
