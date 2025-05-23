import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';

import { AppModule } from './app.module';

const logger = new Logger();

/**
 *
 */
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app
    .listen('8000')
    .then(() => logger.log('API Gateway is listening on port 8000'))
    .catch((error) =>
      logger.error('API Gateway is not listening', error, 'Bootstrap')
    );
}

void bootstrap();
