import type { Cache } from '@nestjs/cache-manager';
import type { ClientProxy } from '@nestjs/microservices';
import type { Repository } from 'typeorm';

import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { Auction } from './auction.entity';
import type { CloseAuctionDto } from './dto/close-auction';
import type { CreateAuctionDto } from './dto/create-auction';

import { AuctionService } from './auction.service';

describe('AuctionService', () => {
  let service: AuctionService;

  const cacheManager = {
    get: vi.fn(),
    set: vi.fn(),
  } as unknown as Cache;

  const natsClient = {
    emit: vi.fn(),
  } as unknown as ClientProxy;

  const auctionRepo = {
    save: vi.fn(),
  } as unknown as Repository<Auction>;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new AuctionService(cacheManager, natsClient, auctionRepo);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createAuction', () => {
    it('should save auction and emit event', async () => {
      const dto: CreateAuctionDto = {
        id: 'seller',
        auctionId: '1',
        auctionName: 'test',
        productId: 'p',
        startDate: new Date(),
        duration: 10,
        startPrice: 100,
      };

      (auctionRepo.save as ReturnType<typeof vi.fn>).mockResolvedValueOnce(dto);
      (natsClient.emit as ReturnType<typeof vi.fn>).mockReturnValueOnce(
        undefined
      );

      const result = await service.createAuction(dto);

      expect(auctionRepo.save).toHaveBeenCalledWith({
        ...dto,
        sellerId: dto.id,
      });
      expect(natsClient.emit).toHaveBeenCalledWith('auction.created', dto);
      expect(result).toEqual(dto);
    });
  });

  describe('getAuction', () => {
    it('should get auction from cache', async () => {
      const dto = { auctionId: '1' } as CreateAuctionDto;

      (cacheManager.get as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
        'auction-data'
      );

      const result = await service.getAuction(dto);

      expect(cacheManager.get).toHaveBeenCalledWith('auction:1:room');
      expect(result).toBe('auction-data');
    });
  });

  describe('placeBid', () => {
    it('should throw if room not found', async () => {
      (cacheManager.get as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
        null
      );

      await expect(
        service.placeBid({ auctionId: '1', clientId: 'c', amount: 150 })
      ).rejects.toThrow('Room auction:1:room not found');
    });

    it('should throw if bid not higher than existing', async () => {
      (cacheManager.get as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        auctionId: '1',
        bids: [{ clientId: 'a', price: 200 }],
        duration: 0,
        endDate: '',
        startDate: '',
        startPrice: 100,
        userId: 'u',
      });

      await expect(
        service.placeBid({ auctionId: '1', clientId: 'c', amount: 150 })
      ).rejects.toThrow('Bid of 150 is not higher than existing bids');
    });

    it('should add bid if amount is higher and update cache', async () => {
      const room = {
        auctionId: '1',
        bids: [{ clientId: 'a', price: 100 }],
        duration: 0,
        endDate: '',
        startDate: '',
        startPrice: 100,
        userId: 'u',
      };

      (cacheManager.get as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
        room
      );
      (cacheManager.set as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
        undefined
      );

      const result = await service.placeBid({
        auctionId: '1',
        clientId: 'c',
        amount: 150,
      });

      expect(result.bids).toContainEqual({ clientId: 'c', price: 150 });
      expect(cacheManager.set).toHaveBeenCalledWith(
        'auction:1:room',
        result,
        0
      );
    });
  });

  describe('closeAuction', () => {
    it('should save auction as closed and emit close event', async () => {
      const dto: CloseAuctionDto = {
        auctionId: '1',
        sellerId: 's',
        finalPrice: 200,
      };

      (auctionRepo.save as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
        undefined
      );
      (natsClient.emit as ReturnType<typeof vi.fn>).mockReturnValueOnce(
        undefined
      );

      await service.closeAuction(dto);

      expect(auctionRepo.save).toHaveBeenCalledWith({ ...dto, statut: true });
      expect(natsClient.emit).toHaveBeenCalledWith('ws.close.auction', {
        price: dto.finalPrice,
        room: dto.auctionId,
      });
    });
  });
});
