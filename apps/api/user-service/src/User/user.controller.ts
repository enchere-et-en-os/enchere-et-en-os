import { Controller, Logger } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { Observable } from 'rxjs';

import { CreateUserDto } from './dto/create-user.dto';
import { User } from './entity/user.entity';
import { UserService } from './user.service';

const logger = new Logger();

@Controller()
export class UserController {
  static readonly BASE_PATTERN = 'user';

  constructor(private userService: UserService) {}

  @MessagePattern('user.create')
  createUser(@Payload() createUserDto: CreateUserDto): Observable<User> {
    logger.log('createUser');
    return this.userService.createUser(createUserDto);
  }
}
