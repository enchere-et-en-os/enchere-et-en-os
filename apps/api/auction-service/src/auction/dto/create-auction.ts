import { IsDate, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateAuctionDto {
  @IsString()
  @IsNotEmpty()
  auctionId: string;

  @IsString()
  @IsNotEmpty()
  auctionName: string;

  @IsString()
  @IsNotEmpty()
  productId: string;

  @IsDate()
  @IsNotEmpty()
  startDate: Date;

  @IsNumber()
  @IsNotEmpty()
  duration: number;

  @IsNumber()
  @IsNotEmpty()
  startPrice: number;
}
