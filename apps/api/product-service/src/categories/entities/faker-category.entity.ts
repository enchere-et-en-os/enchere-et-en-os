import { faker } from '@faker-js/faker';

import { Category } from './category.entity';

export const FakerCategory = {
  generateFakeCategory(parent: Category | null = null): Category {
    const category = new Category();
    category.id = faker.string.uuid();
    category.name = faker.commerce.department();
    category.parent = parent;
    return category;
  },
};
