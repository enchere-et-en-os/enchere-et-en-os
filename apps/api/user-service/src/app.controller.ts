import { Controller, Logger } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { delay, of } from 'rxjs';

const logger = new Logger();

@Controller()
export class AppController {
  @MessagePattern('ping')
  ping() {
    logger.log('ping');
    return of('pong').pipe(delay(1000));
  }
}
