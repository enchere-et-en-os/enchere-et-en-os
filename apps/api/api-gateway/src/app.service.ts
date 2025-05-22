import { Inject, Injectable } from "@nestjs/common";
import { ClientProxy } from "@nestjs/microservices";
import { map } from "rxjs/operators";

@Injectable()
export class AppService {
  constructor(
      @Inject("NATS_SERVICES") private readonly productService: ClientProxy
  ) {}

  pingServices() {
    const startTs = Date.now();
    const pattern = { cmd: "ping" };
    const payload = {};
    return this.productService
        .send<string>(pattern, payload)
        .pipe(
            map((message: string) => ({ message, duration: Date.now() - startTs }))
        );
  }
}