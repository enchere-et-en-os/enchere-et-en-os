import { NestFactory } from '@nestjs/core';
import { Transport } from '@nestjs/microservices';
import { Logger } from '@nestjs/common';
import { JobRunnerModule } from './job-runner.module';

const logger = new Logger();

/**
 *
 */
async function bootstrap() {
  const app = await NestFactory.createMicroservice(JobRunnerModule, {
    transport: Transport.NATS,
    options: {
      servers: [process.env.NATS_URL ?? 'nats://localhost:4222'],
    },
  });
  app
    .listen()
    .then(() => logger.log('Job Runner is listening'))
    .catch((error) =>
      logger.error('Job Runner is not listening ', error, 'Bootstrap'),
    );
}
void bootstrap();
