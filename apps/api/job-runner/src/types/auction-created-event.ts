export type AuctionCreatedEvent = {
  id: string;
  auctionName: string;
  productId: string;
  startDate: string;
  duration: number;
  startPrice: number;
  userId: string;
};
