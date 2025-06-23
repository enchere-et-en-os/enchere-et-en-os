import { Test, type TestingModule } from '@nestjs/testing';
import { beforeEach, describe, expect, it } from 'vitest';

import { CategoriesController } from './categories.controller';
import { CategoriesService } from './categories.service';

describe('CategoriesController', () => {
  let categoriesController: CategoriesController;
  let categoriesService: CategoriesService;

  beforeEach(() => {
    categoriesService = new CategoriesService(
      jest.fn() as never,
      jest.fn() as never
    );
    categoriesController = new CategoriesController(categoriesService);
  });

  it('should be defined', () => {
    expect(categoriesController).toBeDefined();
  });
});
