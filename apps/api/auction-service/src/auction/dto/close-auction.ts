import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CloseAuctionDto {
  @IsString()
  @IsNotEmpty()
  auctionId: string;

  @IsString()
  @IsNotEmpty()
  sellerId: string;

  @IsNumber()
  @IsNotEmpty()
  finalPrice: number;
}
