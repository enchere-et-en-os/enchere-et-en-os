import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

import { Category } from "../../categories/entities/category.entity";

@Entity()
export class Product {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column("text", { array: true, nullable: true })
  images: string[];

  user_id: string;

  @ManyToOne(() => Category, (category) => category.products)
  category: Category;
}
