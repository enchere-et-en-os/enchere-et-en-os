import { PartialType } from '@nestjs/mapped-types';
import { IsUUID } from 'class-validator';

import { CreateCategoryDto } from './create-category.dto';

export class UpdateCategoryDto extends PartialType(CreateCategoryDto) {
  @IsUUID()
  id: string;
}
