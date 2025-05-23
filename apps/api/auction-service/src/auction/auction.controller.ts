import { Controller, Inject } from '@nestjs/common';
import { ClientProxy, EventPattern } from '@nestjs/microservices';

@Controller()
export class AuctionController {
  constructor(@Inject('NATS_SERVICES') private client: ClientProxy) {}

  @EventPattern('ping')
  sendPong(): void {
    this.client.emit('pong', {});
  }
}
