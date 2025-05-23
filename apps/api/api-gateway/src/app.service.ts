import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { map } from 'rxjs/operators';

@Injectable()
export class AppService {
  constructor(
    @Inject('NATS_SERVICES') private readonly productService: ClientProxy
  ) {}

  pingServices() {
    const startTs = Date.now();
    return this.productService
      .send<string>('ping', 'ping')
      .pipe(
        map((message: string) => ({ message, duration: Date.now() - startTs }))
      );
  }

  createUser(body: never) {
    console.log(body);
    return this.productService.send<string>('user.create', body);
  }
}
