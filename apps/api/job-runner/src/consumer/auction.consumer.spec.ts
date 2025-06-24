import { Test, TestingModule } from '@nestjs/testing';
import { AuctionConsumer, AuctionJob } from './auction.consumer';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { ClientProxy } from '@nestjs/microservices';
import { JobRunnerService } from '../job-runner.service';
import { Job } from 'bullmq';
import { AuctionCreatedEvent } from '../types/auction-created-event';
import { beforeEach, describe, it, vi, expect } from 'vitest';

describe('AuctionConsumer', () => {
  let consumer: AuctionConsumer;
  let mockClientProxy: Partial<ClientProxy>;
  let mockCache: {
    set: (key: string, value: unknown, ttl: number) => Promise<void>;
    get: (key: string) => Promise<unknown>;
    del: (key: string) => Promise<void>;
  };
  let mockJobRunnerService: Partial<JobRunnerService>;

  beforeEach(async () => {
    mockClientProxy = {
      emit: vi.fn(),
    };

    mockCache = {
      set: vi.fn(),
      get: vi.fn().mockResolvedValue({}),
      del: vi.fn(),
    };

    mockJobRunnerService = {
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
    (consumer as { jobRunnerService: JobRunnerService }).jobRunnerService =
      mockJobRunnerService as JobRunnerService;
  });

  it('should process start.auction and set data in cache and schedule close', async () => {
    console.log('mockJobRunnerService:', mockJobRunnerService);

    const job = {
      name: 'start.auction',
      data: {
        data: {
          auctionId: 'abc123',
          userId: 'user1',
          startPrice: 100,
          startDate: new Date().toISOString(),
          duration: 10000,
        },
      },
    } as Job<{ data: AuctionCreatedEvent }> & { name: 'start.auction' };

    await consumer.process(job);

    const endDate = new Date(
      new Date(job.data.data.startDate).getTime() + job.data.data.duration,
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
      data: { data: 'auction:abc123:room' },
    } as Job<{ data: string }> & { name: 'close.auction' };

    await consumer.process(job);

    expect(mockCache.get).toHaveBeenCalledWith('auction:abc123:room');
    expect(mockCache.del).toHaveBeenCalledWith('auction:abc123:room');
    expect(mockClientProxy.emit).toHaveBeenCalledWith('auction.close', { job });
  });

  it('should do nothing for unknown job name', async () => {
    const job = {
      name: 'unknown.job',
      data: { data: 'any' },
    } as AuctionJob;

    await expect(consumer.process(job)).resolves.toBeUndefined();
    expect(mockCache.set).not.toHaveBeenCalled();
    expect(mockCache.get).not.toHaveBeenCalled();
    expect(mockClientProxy.emit).not.toHaveBeenCalled();
  });
});
