import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';

import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductService } from './products.service';

@Controller()
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @MessagePattern('create_product')
  create(@Payload() payload: CreateProductDto) {
    return this.productService.create(payload);
  }

  @MessagePattern('update_product')
  update(@Payload() payload: UpdateProductDto & { id: string }) {
    return this.productService.update(payload.id, payload);
  }

  @MessagePattern('get_product')
  findOne(@Payload() payload: { id: string }) {
    return this.productService.findOne(payload.id);
  }

  @MessagePattern('get_all_products')
  findAll() {
    return this.productService.findAll();
  }

  @MessagePattern('delete_product')
  remove(@Payload() payload: { id: string }) {
    return this.productService.remove(payload.id);
  }
}
