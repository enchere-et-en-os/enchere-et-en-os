import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AuctionListener } from './auction.listener';
import { AuctionCreatedEvent } from '../types/auction-created-event';
import { JobRunnerService } from '../job-runner.service';

describe('AuctionListener', () => {
  let listener: AuctionListener;
  let jobRunnerMock: Partial<JobRunnerService>;

  const validEvent: AuctionCreatedEvent = {
    id: 'auction-1',
    auctionName: 'Auction',
    productId: 'product-123',
    startDate: new Date().toISOString(),
    duration: 120000,
    startPrice: 100,
    userId: 'user-001',
  };

  beforeEach(() => {
    jobRunnerMock = {
      startAuction: vi.fn(),
    };

    listener = new AuctionListener(jobRunnerMock as JobRunnerService);
    vi.clearAllMocks();
  });

  it('should call startAuction with correct data and parsed date', async () => {
    await listener.auctionCreated(validEvent);

    expect(jobRunnerMock.startAuction).toHaveBeenCalledTimes(1);
    expect(jobRunnerMock.startAuction).toHaveBeenCalledWith(
      validEvent,
      new Date(validEvent.startDate),
    );
  });

  it('should throw if startDate is not a valid date string', async () => {
    const event = {
      ...validEvent,
      startDate: 'not-a-valid-date',
    };

    await expect(() => listener.auctionCreated(event)).rejects.toThrow(
      'Invalid Date',
    );
    expect(jobRunnerMock.startAuction).not.toHaveBeenCalled();
  });

  it('should throw if startDate is undefined', async () => {
    const event = { ...validEvent, startDate: undefined as unknown as string };

    await expect(() => listener.auctionCreated(event)).rejects.toThrow();
    expect(jobRunnerMock.startAuction).not.toHaveBeenCalled();
  });

  it('should throw if startDate is an object', async () => {
    const event = { ...validEvent, startDate: {} as unknown as string };

    await expect(() => listener.auctionCreated(event)).rejects.toThrow();
    expect(jobRunnerMock.startAuction).not.toHaveBeenCalled();
  });

  it('should not throw with a precise ISO string', async () => {
    const preciseDate = new Date().toISOString();
    const event = { ...validEvent, startDate: preciseDate };

    await listener.auctionCreated(event);

    expect(jobRunnerMock.startAuction).toHaveBeenCalledWith(
      event,
      new Date(preciseDate),
    );
  });
});
