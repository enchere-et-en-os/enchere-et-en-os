import { faker } from '@faker-js/faker';

import { type Category } from '../../categories/entities/category.entity';
import { Product } from './product.entity';

export const FakerProduct = {
  generateFakeProduct(category: Category): Product {
    const product = new Product();
    product.id = faker.string.uuid();
    product.name = faker.commerce.productName();
    product.description = faker.commerce.productDescription();
    product.images = [faker.image.url(), faker.image.url()];
    product.category = category;
    return product;
  },
};
