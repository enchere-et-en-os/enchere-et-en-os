import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Auction {
  @PrimaryGeneratedColumn()
  auctionId: string;

  @Column({ nullable: false })
  sellerId: string;

  @Column()
  buyerId: string;

  @Column({ nullable: false })
  auctionName: string;

  @Column({ nullable: false })
  productId: string;

  @Column({ nullable: false })
  startDate: Date;

  @Column({ nullable: false })
  duration: number;

  @Column({ nullable: false, default: false })
  statut: boolean;

  @Column({ nullable: false })
  startPrice: number;

  @Column()
  lastPrice: number;
}
