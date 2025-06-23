import { Test, TestingModule } from '@nestjs/testing';
import { AuctionConsumer } from './auction.consumer';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { ClientProxy } from '@nestjs/microservices';
import { JobRunnerService } from '../job-runner.service';
import { Job } from 'bullmq';
import { AuctionCreatedEvent } from '../types/auction-created-event';
import { beforeEach, describe, it, vi } from 'vitest';

describe('AuctionConsumer', () => {
  let consumer: AuctionConsumer;
  let mockClientProxy: ClientProxy;
  let mockCache: {
    set: (key: string, value: unknown, ttl: number) => Promise<void>;
    get: (key: string) => Promise<unknown>;
    del: (key: string) => Promise<void>;
  };
  let mockJobRunnerService: JobRunnerService;

  beforeEach(async () => {
    mockClientProxy = {
      emit: vi.fn(),
    } as unknown as ClientProxy;

    mockCache = {
      set: vi.fn(),
      get: vi.fn().mockResolvedValue({}),
      del: vi.fn(),
    };

    const mockJobRunnerService: Partial<JobRunnerService> = {
      closeAuction: vi.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuctionConsumer,
        { provide: 'NATS_SERVICES', useValue: mockClientProxy },
        { provide: CACHE_MANAGER, useValue: mockCache },
        { provide: JobRunnerService, useValue: mockJobRunnerService },
      ],
    }).compile();

    consumer = module.get(AuctionConsumer);
  });

  it('should process start.auction and set data in cache and schedule close', async () => {
    const job = {
      name: 'start.auction',
      data: {
        auctionId: 'abc123',
        userId: 'user1',
        startPrice: 100,
        startDate: new Date().toISOString(),
        duration: 10000,
      },
    } as Job<AuctionCreatedEvent> & { name: 'start.auction' };

    await consumer.process(job);

    const endDate = new Date(
      new Date(job.data.startDate).getTime() + job.data.duration,
    );

    expect(mockCache.set).toHaveBeenCalledWith(
      'auction:abc123:room',
      {
        ...job.data,
        endDate,
        bids: [
          {
            userId: 'user1',
            price: 100,
          },
        ],
      },
      0,
    );

    expect(mockJobRunnerService.closeAuction).toHaveBeenCalledWith(
      'auction:abc123:room',
      10000,
    );
  });

  it('should process close.auction and emit event then delete cache', async () => {
    const job = {
      name: 'close.auction',
      data: 'auction:abc123:room',
    } as Job<string> & { name: 'close.auction' };

    await consumer.process(job);

    expect(mockCache.get).toHaveBeenCalledWith('auction:abc123:room');
    expect(mockCache.del).toHaveBeenCalledWith('auction:abc123:room');
    expect(mockClientProxy.emit).toHaveBeenCalledWith('auction.close', { job });
  });

  it('should do nothing for unknown job name', async () => {
    const job = {
      name: 'unknown.job',
      data: {},
    } as Job<unknown> & { name: string };

    await expect(consumer.process(job)).resolves.toBeUndefined();
    expect(mockCache.set).not.toHaveBeenCalled();
    expect(mockCache.get).not.toHaveBeenCalled();
    expect(mockClientProxy.emit).not.toHaveBeenCalled();
  });
});
