import { Controller, Get } from '@nestjs/common';

import { AppService} from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  
  @Get("/ping-services")
  pingServices() {
    return this.appService.pingServices();
  }
}
