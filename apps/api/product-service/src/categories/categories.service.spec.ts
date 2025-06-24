import 'reflect-metadata';
import {
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Test, type TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { Product } from '../products/entities/product.entity';
import { CategoriesService } from './categories.service';
import { type CreateCategoryDto } from './dto/create-category.dto';
import { type UpdateCategoryDto } from './dto/update-category.dto';
import { Category } from './entities/category.entity';
import { FakerCategory } from './entities/faker-category.entity';

const mockCategoryRepo = {
  save: vi.fn(),
  find: vi.fn(),
  findOne: vi.fn(),
  findOneBy: vi.fn(),
  update: vi.fn(),
  remove: vi.fn(),
};

const mockProductRepo = {
  update: vi.fn(),
};

describe('CategoriesService', () => {
  let service: CategoriesService;
  let categoryRepo: typeof mockCategoryRepo;
  let productRepo: typeof mockProductRepo;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CategoriesService,
        {
          provide: getRepositoryToken(Category),
          useValue: mockCategoryRepo,
        },
        {
          provide: getRepositoryToken(Product),
          useValue: mockProductRepo,
        },
      ],
    }).compile();

    service = module.get<CategoriesService>(CategoriesService);
    categoryRepo = module.get(getRepositoryToken(Category));
    productRepo = module.get(getRepositoryToken(Product));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a category without parent', async () => {
      const category = FakerCategory.generateFakeCategory();
      const dto: CreateCategoryDto = { name: category.name };

      categoryRepo.save.mockResolvedValue(category);

      const result = await service.create(dto);
      expect(result).toEqual(category);
      expect(categoryRepo.save).toHaveBeenCalledWith({
        name: dto.name,
        parent: null,
      });
    });

    it('should create a category with parent', async () => {
      const parentCategory = FakerCategory.generateFakeCategory();
      const childCategory = FakerCategory.generateFakeCategory(parentCategory);

      const dto: CreateCategoryDto = {
        name: childCategory.name,
        parentId: parentCategory.id,
      };

      await service.create(dto);

      expect(categoryRepo.save).toHaveBeenCalledWith({
        name: childCategory.name,
        parent: { id: parentCategory.id },
      });
    });
  });

  describe('findAll', () => {
    it('should return all categories', async () => {
      const categories: Category[] = [
        FakerCategory.generateFakeCategory(),
      ] as Category[];
      categoryRepo.find.mockResolvedValue(categories);

      const result = await service.findAll();
      expect(result).toEqual(categories);
    });
  });

  describe('findOne', () => {
    it('should return a category by id', async () => {
      const category: Category = FakerCategory.generateFakeCategory();
      categoryRepo.findOne.mockResolvedValue(category);

      const result = await service.findOne(category.id);
      expect(result).toEqual(category);
    });
  });

  describe('update', () => {
    it('should update a category', async () => {
      const dto: UpdateCategoryDto = {
        id: '1',
        name: 'Updated',
        parentId: '2',
      };

      categoryRepo.findOneBy.mockResolvedValue({ id: '2' } as Category);

      await service.update(dto);

      expect(categoryRepo.update).toHaveBeenCalledWith(
        { id: '1' },
        {
          name: 'Updated',
          parent: { id: '2' },
        }
      );
    });

    it('should throw if parent not found', async () => {
      const dto: UpdateCategoryDto = {
        id: '1',
        name: 'New',
        parentId: '999',
      };

      categoryRepo.findOneBy.mockResolvedValue(null);

      await expect(() => service.update(dto)).rejects.toThrowError(
        NotFoundException
      );
    });
  });

  describe('moveProducts', () => {
    it('should move products from one category to another', async () => {
      productRepo.update.mockResolvedValue({ affected: 1 });

      const result = await service.moveProducts('from-id', 'to-id');
      expect(result).toEqual({ affected: 1 });
    });

    it('should throw on error', async () => {
      productRepo.update.mockRejectedValue(new Error('DB error'));

      await expect(() =>
        service.moveProducts('from', 'to')
      ).rejects.toThrowError(InternalServerErrorException);
    });
  });

  describe('remove', () => {
    it('should remove a category', async () => {
      const category: Category = { id: '1', name: 'Test' } as Category;
      categoryRepo.findOneBy.mockResolvedValue(category);
      categoryRepo.remove.mockResolvedValue(category);

      const result = await service.remove('1');
      expect(result).toEqual(category);
    });

    it('should throw if category not found', async () => {
      categoryRepo.findOneBy.mockResolvedValue(null);

      await expect(() => service.remove('999')).rejects.toThrowError(
        NotFoundException
      );
    });
  });
});
