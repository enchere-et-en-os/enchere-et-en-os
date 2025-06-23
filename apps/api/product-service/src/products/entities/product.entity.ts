import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

import { Category } from '../../categories/entities/category.entity';

@Entity()
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar' })
  name: string;

  @Column({ nullable: true, type: 'varchar' })
  description: string;

  @Column('text', { array: true, nullable: true })
  images: string[];

  @ManyToOne(() => Category, (category) => category.products)
  category: Category;
}
