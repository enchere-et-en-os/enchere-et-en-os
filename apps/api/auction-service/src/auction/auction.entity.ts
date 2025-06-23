import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Auction {
  @PrimaryGeneratedColumn('uuid')
  auctionId: string;

  @Column({ type: 'uuid' })
  sellerId: string;

  @Column({ nullable: false, type: 'uuid' })
  buyerId: string;

  @Column({ type: 'varchar' })
  auctionName: string;

  @Column({ type: 'uuid' })
  productId: string;

  @Column({ type: Date })
  startDate: Date;

  @Column({ type: 'number' })
  duration: number;

  @Column({ default: false, type: 'boolean' })
  statut: boolean;

  @Column({ type: 'number' })
  startPrice: number;

  @Column({ nullable: false, type: 'number' })
  lastPrice: number;
}
