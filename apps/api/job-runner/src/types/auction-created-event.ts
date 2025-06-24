export type AuctionCreatedEvent = {
  auctionId: string;
  auctionName: string;
  productId: string;
  startDate: string;
  duration: number;
  startPrice: number;
  userId: string;
};
