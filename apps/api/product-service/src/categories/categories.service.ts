import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from './entities/category.entity';
import { Product } from '../products/entities/product.entity';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category) private repository: Repository<Category>,
    @InjectRepository(Product) private productRepository: Repository<Product>,
  ) {}

  async create(createCategoryDto: CreateCategoryDto) {
    if (!(await this.repository.findOneBy({ id: createCategoryDto.parentId })))
      throw new NotFoundException('Category parent not found');

    return this.repository.save({
      name: createCategoryDto.name,
      parent: createCategoryDto.parentId
        ? { id: createCategoryDto.parentId }
        : null,
    });
  }

  findAll() {
    return this.repository.find({ relations: ['parent', 'children'] });
  }

  findOne(id: string) {
    return this.repository.findOne({
      where: { id },
      relations: ['parent', 'children'],
    });
  }

  async update(id: string, updateCategoryDto: UpdateCategoryDto) {
    if (!(await this.repository.findOneBy({ id: updateCategoryDto.parentId })))
      throw new NotFoundException('Category parent not found');

    return this.repository.update(id, updateCategoryDto);
  }

  async moveProducts(fromId: string, toId: string) {
    try {
      return this.productRepository.update(
        { category: { id: fromId } },
        { category: { id: toId } },
      );
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async remove(id: string) {
    try {
      const category = await this.repository.findOneBy({ id });
      return this.repository.remove(category);
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }
}
