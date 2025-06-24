import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';

@Injectable()
export class AppService {
  constructor(
    @Inject('NATS_SERVICES') private readonly productService: ClientProxy
  ) {}

  createUser(body: never) {
    return this.productService.send<string>('user.create', body);
  }
}
