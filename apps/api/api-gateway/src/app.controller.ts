import { Body, Controller, Post } from '@nestjs/common';

import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Post('/user')
  createUser(@Body() body: never) {
    return this.appService.createUser(body);
  }
}
