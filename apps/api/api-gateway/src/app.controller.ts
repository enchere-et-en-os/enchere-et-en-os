import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from 'nest-keycloak-connect';

import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('/ping-services')
  @UseGuards(AuthGuard)
  pingServices() {
    return this.appService.pingServices();
  }

  @Post('/user')
  createUser(@Body() body: never) {
    return this.appService.createUser(body);
  }
}
