import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Category } from '../categories/entities/category.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product } from './entities/product.entity';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,
    @InjectRepository(Category)
    private readonly categoryRepo: Repository<Category>
  ) {}

  async create(dto: CreateProductDto) {
    if (
      !(await this.categoryRepo.findOneBy({
        id: dto.categoryId,
      }))
    )
      throw new NotFoundException('Category not found');

    return this.productRepo.save(dto);
  }

  async update(id: string, dto: UpdateProductDto) {
    const product = await this.productRepo.findOneBy({ id });
    if (!product) throw new NotFoundException('Product not found');

    if (
      !(await this.categoryRepo.findOneBy({
        id: dto.categoryId,
      }))
    )
      throw new NotFoundException('Category not found');

    const updated = this.productRepo.merge(product, {
      ...dto,
      category: {
        id: dto.categoryId,
      },
    });
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
