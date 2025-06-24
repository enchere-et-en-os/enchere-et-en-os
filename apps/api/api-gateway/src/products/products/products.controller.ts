import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { AuthGuard } from 'nest-keycloak-connect';

import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Controller('product')
@UseGuards(AuthGuard)
export class ProductController {
  constructor(
    @Inject('NATS_SERVICES') private readonly productService: ClientProxy
  ) {}

  @Post()
  async create(@Body() body: CreateProductDto) {
    return this.productService.send('create_product', body);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() body: UpdateProductDto) {
    return this.productService.send('update_product', {
      id,
      ...body,
    });
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.productService.send('get_product', { id });
  }

  @Get()
  async findAll() {
    return this.productService.send('get_all_products', {});
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.productService.send('delete_product', {
      id,
    });
  }
}
