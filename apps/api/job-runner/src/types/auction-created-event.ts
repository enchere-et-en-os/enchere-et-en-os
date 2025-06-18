export type AuctionCreatedEvent = {
  auctionId: string;
  auctionName: string;
  productId: string;
  startDate: Date;
  duration: number;
  startPrice: number;
};
