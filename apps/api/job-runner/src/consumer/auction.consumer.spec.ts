import { Test, TestingModule } from '@nestjs/testing';
import { AuctionConsumer, AuctionJob } from './auction.consumer';
import { ClientProxy } from '@nestjs/microservices';
import { JobRunnerService } from '../job-runner.service';
import { Job } from 'bullmq';
import { AuctionCreatedEvent } from '../types/auction-created-event';
import { beforeEach, describe, it, vi, expect } from 'vitest';

describe('AuctionConsumer', () => {
  let consumer: AuctionConsumer;
  let mockClientProxy: Partial<ClientProxy>;
  let mockJobRunnerService: Partial<JobRunnerService>;
  let mockRedisClient: {
    set: ReturnType<typeof vi.fn>;
    get: ReturnType<typeof vi.fn>;
    del: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    mockClientProxy = {
      emit: vi.fn(),
    };

    mockJobRunnerService = {
      closeAuction: vi.fn(),
    };

    mockRedisClient = {
      set: vi.fn(),
      get: vi.fn().mockResolvedValue(
        JSON.stringify({
          id: 'abc123',
          userId: 'user1',
          productId: 'product 1',
          auctionName: 'auction 1',
        }),
      ),
      del: vi.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuctionConsumer,
        { provide: 'REDIS_CLIENT', useValue: mockRedisClient },
        { provide: 'NATS_SERVICES', useValue: mockClientProxy },
        { provide: JobRunnerService, useValue: mockJobRunnerService },
      ],
    }).compile();

    consumer = module.get(AuctionConsumer);
    (consumer as { jobRunnerService: JobRunnerService }).jobRunnerService =
      mockJobRunnerService as JobRunnerService;
  });

  it('should process start.auction and set data in Redis and schedule close', async () => {
    const now = new Date().toISOString();
    const job = {
      name: 'start.auction',
      data: {
        data: {
          auctionId: 'abc123',
          auctionName: 'auction 1',
          productId: 'product 1',
          startDate: now,
          duration: 10000,
          startPrice: 100,
          userId: 'user1',
        },
      },
    } as Job<{ data: AuctionCreatedEvent }> & { name: 'start.auction' };

    const endDate = new Date(new Date(now).getTime() + 10000);

    await consumer.process(job);

    expect(mockRedisClient.set).toHaveBeenCalledWith(
      'auction:abc123:room',
      JSON.stringify({
        ...job.data,
        endDate,
        bids: [
          {
            userId: 'user1',
            price: 100,
          },
        ],
      }),
    );

    expect(mockJobRunnerService.closeAuction).toHaveBeenCalledWith(
      'auction:abc123:room',
      10000,
    );
  });

  it('should process close.auction and emit event then delete Redis key', async () => {
    const job = {
      name: 'close.auction',
      data: { data: 'auction:abc123:room' },
    } as Job<{ data: string }> & { name: 'close.auction' };

    await consumer.process(job);

    expect(mockRedisClient.get).toHaveBeenCalledWith('auction:abc123:room');
    expect(mockRedisClient.del).toHaveBeenCalledWith('auction:abc123:room');
  });

  it('should do nothing for unknown job name', async () => {
    const job = {
      name: 'unknown.job',
      data: { data: 'any' },
    } as AuctionJob;

    await expect(consumer.process(job)).resolves.toBeUndefined();
    expect(mockRedisClient.set).not.toHaveBeenCalled();
    expect(mockRedisClient.get).not.toHaveBeenCalled();
    expect(mockClientProxy.emit).not.toHaveBeenCalled();
  });
});
