import type { Cache } from '@nestjs/cache-manager';
import type { ClientProxy } from '@nestjs/microservices';
import type { Repository } from 'typeorm';

import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { Auction } from './auction.entity';
import type { CloseAuctionDto } from './dto/close-auction';
import type { CreateAuctionDto } from './dto/create-auction';

import { AuctionService } from './auction.service';

// ---- Mock dependencies for AuctionService ----

// Mock for the cache manager
const cacheManager = {
  get: vi.fn(),
  set: vi.fn(),
} as unknown as Cache;

// Mock for the NATS client
const natsClient = {
  emit: vi.fn(),
} as unknown as ClientProxy;

// Mock for the Auction repository
const auctionRepo = {
  save: vi.fn(),
} as unknown as Repository<Auction>;

// ---- Main test suite for AuctionService ----

describe('AuctionService', () => {
  let service: AuctionService;

  // Reset mocks and create a fresh service instance before each test
  beforeEach(() => {
    vi.clearAllMocks();
    service = new AuctionService(cacheManager, natsClient, auctionRepo);
  });

  // Sanity check: the service should be defined
  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // ---- Tests for createAuction ----

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

      // Mock repository save and NATS emit
      (
        auctionRepo.save as unknown as ReturnType<typeof vi.fn>
      ).mockResolvedValueOnce(undefined);
      (
        natsClient.emit as unknown as ReturnType<typeof vi.fn>
      ).mockReturnValueOnce(undefined);

      // Call the method
      const result = await service.createAuction(dto);

      // It should save the auction with sellerId
      expect(auctionRepo.save).toHaveBeenCalledWith({
        ...dto,
        sellerId: dto.id,
      });

      // It should emit an 'auction.created' event
      expect(natsClient.emit).toHaveBeenCalledWith('auction.created', dto);

      // It should return the DTO
      expect(result).toBe(dto);
    });
  });

  // ---- Tests for getAuction ----

  describe('getAuction', () => {
    it('should get auction from cache', async () => {
      const dto = { auctionId: '1' } as CreateAuctionDto;

      // Mock cache get
      (
        cacheManager.get as unknown as ReturnType<typeof vi.fn>
      ).mockResolvedValueOnce('auction-data');

      const result = await service.getAuction(dto);

      // It should look up the auction using a key
      expect(cacheManager.get).toHaveBeenCalledWith('key:1');
      expect(result).toBe('auction-data');
    });
  });

  // ---- Tests for placeBid ----

  describe('placeBid', () => {
    it('should set bid in cache', async () => {
      const data = { amount: 10, clientId: 'c', room: 'r' };

      // Mock cache set
      (
        cacheManager.set as unknown as ReturnType<typeof vi.fn>
      ).mockResolvedValueOnce(undefined);

      const result = await service.placeBid(data);

      // It should save the bid in cache with the correct key
      expect(cacheManager.set).toHaveBeenCalledWith('bid:r', data, 0);
      expect(result).toBe(data);
    });
  });

  // ---- Tests for getBid ----

  describe('getBid', () => {
    it('should get bid from cache', async () => {
      (
        cacheManager.get as unknown as ReturnType<typeof vi.fn>
      ).mockResolvedValueOnce('bid-data');

      const result = await service.getBid('room1');

      // It should retrieve the bid using the key
      expect(cacheManager.get).toHaveBeenCalledWith('bid:room1');
      expect(result).toBe('bid-data');
    });
  });

  // ---- Tests for closeAuction ----

  describe('closeAuction', () => {
    it('should save auction as closed and emit close event', async () => {
      const dto: CloseAuctionDto = {
        auctionId: '1',
        sellerId: 's',
        finalPrice: 200,
      };

      // Mock save and emit
      (
        auctionRepo.save as unknown as ReturnType<typeof vi.fn>
      ).mockResolvedValueOnce(undefined);
      (
        natsClient.emit as unknown as ReturnType<typeof vi.fn>
      ).mockReturnValueOnce(undefined);

      await service.closeAuction(dto);

      // It should mark the auction as closed (statut = true)
      expect(auctionRepo.save).toHaveBeenCalledWith({ ...dto, statut: true });

      // It should emit a WebSocket close event
      expect(natsClient.emit).toHaveBeenCalledWith('ws.close.auction', {
        price: dto.finalPrice,
        room: dto.auctionId,
      });
    });
  });
});
