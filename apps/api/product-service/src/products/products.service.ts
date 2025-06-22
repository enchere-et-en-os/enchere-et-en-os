import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product } from './entities/product.entity';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>
  ) {}

  async create(dto: CreateProductDto) {
    const product = this.productRepo.create(dto);
    return this.productRepo.save(product);
  }

  async update(id: string, dto: UpdateProductDto) {
    const product = await this.productRepo.findOneBy({ id });
    if (!product) throw new NotFoundException('Product not found');

    const updated = this.productRepo.merge(product, dto);
    return this.productRepo.save(updated);
  }

  async findOne(id: string) {
    const product = await this.productRepo.findOne({
      where: { id },
      relations: ['category'],
    });
    if (!product) throw new NotFoundException('Product not found');
    return product;
  }

  async findAll() {
    return this.productRepo.find({ relations: ['category'] });
  }

  async remove(id: string) {
    const product = await this.productRepo.findOneBy({ id });
    if (!product) throw new NotFoundException('Product not found');
    return this.productRepo.remove(product);
  }
}
