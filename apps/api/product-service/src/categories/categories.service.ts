import { Injectable } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from './entities/category.entity';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category) private repository: Repository<Category>,
  ) {}

  async create(createCategoryDto: CreateCategoryDto) {
    const category = this.repository.create({
      name: createCategoryDto.name,
    });

    if (createCategoryDto.parentId) {
      category.parent = await this.repository.findOneBy({
        id: createCategoryDto.parentId,
      });
    }

    return this.repository.save(category);
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
    const category = await this.repository.findOne({ where: { id } });

    if (updateCategoryDto.name) category.name = updateCategoryDto.name;

    if (updateCategoryDto.parentId) {
      category.parent = await this.repository.findOneBy({
        id: updateCategoryDto.parentId,
      });
    }

    return this.repository.save(category);
  }

  async remove(id: string) {
    const category = await this.repository.findOneBy({ id });
    return this.repository.remove(category);
  }
}
