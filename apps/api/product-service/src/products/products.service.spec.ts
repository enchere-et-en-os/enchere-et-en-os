import { NotFoundException } from '@nestjs/common';
import { Test, type TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { Category } from '../categories/entities/category.entity';
import { FakerCategory } from '../categories/entities/faker-category.entity';
import { type CreateProductDto } from './dto/create-product.dto';
import { type UpdateProductDto } from './dto/update-product.dto';
import { FakerProduct } from './entities/faker-product.entity';
import { Product } from './entities/product.entity';
import { ProductService } from './products.service';

describe('ProductService', () => {
  let service: ProductService;

  const mockProductRepo = {
    save: vi.fn(),
    findOneBy: vi.fn(),
    findOne: vi.fn(),
    find: vi.fn(),
    merge: vi.fn(),
    remove: vi.fn(),
  };

  const mockCategoryRepo = {
    findOneBy: vi.fn(),
  };

  const category = FakerCategory.generateFakeCategory();
  const exampleProduct = FakerProduct.generateFakeProduct(category);

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductService,
        {
          provide: getRepositoryToken(Product),
          useValue: mockProductRepo,
        },
        {
          provide: getRepositoryToken(Category), // ou `Category` si c’est l'entity réelle utilisée
          useValue: mockCategoryRepo,
        },
      ],
    }).compile();

    service = module.get<ProductService>(ProductService);

    vi.clearAllMocks();
  });

  it('should create a product', async () => {
    const dto: CreateProductDto = {
      name: exampleProduct.name,
      description: exampleProduct.description,
      images: exampleProduct.images,
      categoryId: category.id,
    };

    mockCategoryRepo.findOneBy.mockResolvedValue(category);
    mockProductRepo.save.mockResolvedValue({ ...dto, id: exampleProduct.id });

    const result = await service.create(dto as CreateProductDto); // `as any` si le service attend `category` complet
    expect(mockProductRepo.save).toHaveBeenCalledWith(dto);
    expect(result).toEqual({ ...dto, id: exampleProduct.id });
  });

  it('should update an existing product', async () => {
    const updateDto: UpdateProductDto = {
      name: 'Updated Product Name',
    };

    mockProductRepo.findOneBy.mockResolvedValue(exampleProduct);
    mockProductRepo.merge.mockReturnValue({
      ...exampleProduct,
      ...updateDto,
    });
    mockProductRepo.save.mockResolvedValue({
      ...exampleProduct,
      ...updateDto,
    });

    const result = await service.update(exampleProduct.id, updateDto);
    expect(result.name).toBe(updateDto.name);
  });

  it('should throw when updating non-existent product', async () => {
    mockProductRepo.findOneBy.mockResolvedValue(null);

    await expect(() =>
      service.update('non-existent-id', { name: 'x' })
    ).rejects.toThrow(NotFoundException);
  });

  it('should return a product by id', async () => {
    mockProductRepo.findOne.mockResolvedValue(exampleProduct);

    const result = await service.findOne(exampleProduct.id);
    expect(result).toEqual(exampleProduct);
  });

  it('should throw when product not found in findOne', async () => {
    mockProductRepo.findOne.mockResolvedValue(null);

    await expect(() => service.findOne('not-found')).rejects.toThrow(
      NotFoundException
    );
  });

  it('should return all products', async () => {
    mockProductRepo.find.mockResolvedValue([exampleProduct]);

    const result = await service.findAll();
    expect(result).toEqual([exampleProduct]);
  });

  it('should remove an existing product', async () => {
    mockProductRepo.findOneBy.mockResolvedValue(exampleProduct);
    mockProductRepo.remove.mockResolvedValue(exampleProduct);

    const result = await service.remove(exampleProduct.id);
    expect(result).toEqual(exampleProduct);
  });

  it('should throw when removing non-existent product', async () => {
    mockProductRepo.findOneBy.mockResolvedValue(null);

    await expect(() => service.remove('invalid')).rejects.toThrow(
      NotFoundException
    );
  });
});
