import { IsUUID } from 'class-validator';

export class CreateUserDto {
  @IsUUID('4')
  readonly keycloakId: string;
}
