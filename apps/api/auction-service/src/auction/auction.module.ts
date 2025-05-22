import { Module } from "@nestjs/common";
import { AuctionGateway } from "./auction.gateway";
import { AuctionService } from "./auction.service";

@Module({
  imports: [],
  controllers: [AuctionGateway],
  providers: [AuctionService]
})

export class AuctionModule {} 