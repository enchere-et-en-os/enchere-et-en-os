import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';

import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Controller('categories')
export class CategoriesController {
  constructor(@Inject('NATS_SERVICES') private client: ClientProxy) {}

  @Post()
  createCategory(@Body() data: CreateCategoryDto) {
    return this.client.send('category.create', data);
  }

  @Get()
  getAllCategories() {
    return this.client.send('category.findAll', '');
  }

  @Get(':id')
  getOneCategory(@Param('id') id: string) {
    return this.client.send('category.findOne', id);
  }

  @Patch(':id')
  updateCategory(@Param('id') id: string, @Body() data: UpdateCategoryDto) {
    return this.client.send('category.update', data);
  }

  @Delete(':id')
  deleteCategory(@Param('id') id: string) {
    return this.client.send('category.delete', id);
  }

  @Patch(':fromId/to/:toId')
  moveProduct(@Param('fromId') fromId: string, @Param('toId') toId: string) {
    return this.client.send('category.moveProduct', { fromId, toId });
  }
}
