import { Body, Controller, Get, Post } from '@nestjs/common';

import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('/ping-services')
  pingServices() {
    return this.appService.pingServices();
  }

  @Post('/user')
  createUser(@Body() body: never) {
    return this.appService.createUser(body);
  }
}
