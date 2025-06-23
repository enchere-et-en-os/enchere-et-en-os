import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';

import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Controller()
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @MessagePattern('category.create')
  create(@Payload() createCategoryDto: CreateCategoryDto) {
    return this.categoriesService.create(createCategoryDto);
  }

  @MessagePattern('category.findAll')
  findAll() {
    return this.categoriesService.findAll();
  }

  @MessagePattern('category.findOne')
  findOne(@Payload() id: string) {
    return this.categoriesService.findOne(id);
  }

  @MessagePattern('category.update')
  update(
    @Payload()
    updateCategoryDto: UpdateCategoryDto
  ) {
    return this.categoriesService.update(updateCategoryDto);
  }

  @MessagePattern('category.moveProduct')
  moveProducts(@Payload() { fromId, toId }: { fromId: string; toId: string }) {
    return this.categoriesService.moveProducts(fromId, toId);
  }

  @MessagePattern('category.delete')
  remove(@Payload() id: string) {
    return this.categoriesService.remove(id);
  }
}
