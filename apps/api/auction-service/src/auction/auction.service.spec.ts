import { Test, type TestingModule } from '@nestjs/testing';

import { AuctionService } from './auction.service';

describe('AuctionService', () => {
  let auctionService: AuctionService;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      providers: [AuctionService],
    }).compile();

    auctionService = app.get<AuctionService>(AuctionService);
  });

  describe('root', () => {
    it('should intialize', () => {
      expect(auctionService).toBeDefined();
    });
  });
});
