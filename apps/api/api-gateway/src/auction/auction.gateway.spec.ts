import type { Cache } from '@nestjs/cache-manager';
import type { ClientProxy } from '@nestjs/microservices';
import type { Server, Socket } from 'socket.io';

import { Logger } from '@nestjs/common';
import { beforeEach, describe, expect, it, type Mock, vi } from 'vitest';

import { AuctionGateway } from './auction.gateway';

// Properly typed mocks for ClientProxy, Cache, Socket, and Server
interface MockedClientProxy extends Pick<ClientProxy, 'emit' | 'send'> {
  emit: Mock;
  send: Mock;
}

interface MockedCache extends Pick<Cache, 'get' | 'set'> {
  get: Mock;
  set: Mock;
}

interface MockedSocket extends Pick<Socket, 'emit' | 'id' | 'join'> {
  id: string;
  emit: Mock;
  join: Mock;
}

interface MockedServer extends Pick<Server, 'emit' | 'to'> {
  emit: Mock;
  to: Mock;
}

// MAIN TEST SUITE
describe('AuctionGateway', () => {
  let gateway: AuctionGateway;
  let mockClientProxy: MockedClientProxy;
  let mockCacheManager: MockedCache;
  let mockServer: MockedServer;
  let mockSocket: MockedSocket;

  beforeEach(() => {
    mockClientProxy = {
      send: vi.fn(),
      emit: vi.fn(),
    };

    mockCacheManager = {
      get: vi.fn(),
      set: vi.fn(),
    };

    mockServer = {
      to: vi.fn().mockReturnThis(),
      emit: vi.fn(),
    };

    gateway = new AuctionGateway(
      mockClientProxy as unknown as ClientProxy,
      mockCacheManager as unknown as Cache
    );
    gateway.io = mockServer as unknown as Server;

    mockSocket = {
      id: 'client123',
      join: vi.fn(),
      emit: vi.fn(),
    };

    vi.spyOn(Logger.prototype, 'log').mockImplementation(() => {});
    vi.spyOn(Logger.prototype, 'error').mockImplementation(() => {});
  });

  it('should log after initialization', () => {
    gateway.afterInit();
    expect(Logger.prototype.log).toHaveBeenCalledWith('Initialized');
  });

  it('should log connection', () => {
    gateway.handleConnection(mockSocket as unknown as Socket);
    expect(Logger.prototype.log).toHaveBeenCalledWith(
      `Client connected: ${mockSocket.id}`
    );
  });

  it('should log disconnection', () => {
    gateway.handleDisconnect(mockSocket as unknown as Socket);
    expect(Logger.prototype.log).toHaveBeenCalledWith(
      `Client disconnected: ${mockSocket.id}`
    );
  });

  it('should join room and notify others', async () => {
    await gateway.joinRoom(mockSocket as unknown as Socket, 'auction1');

    expect(mockSocket.join).toHaveBeenCalledWith('auction1');
    expect(mockServer.to).toHaveBeenCalledWith('auction1');
    expect(mockServer.emit).toHaveBeenCalledWith(
      'new-user',
      `User ${mockSocket.id} connected`
    );
  });

  it('should forward place-bid data to NATS', async () => {
    const bidData = {
      amount: 150,
      auctionId: 'auction42',
      userId: 'userX',
    };

    await gateway.placeBid(mockSocket as unknown as Socket, bidData);

    expect(mockClientProxy.send).toHaveBeenCalledWith('place-bid', {
      amount: 150,
      auctionId: 'auction42',
      clientId: mockSocket.id,
    });
  });

  it('should handle bid response', () => {
    gateway.handleBidResponse({ amount: 200, room: 'room2' });
    expect(mockServer.to).toHaveBeenCalledWith('room2');
    expect(mockServer.emit).toHaveBeenCalledWith('bid-processed', {
      amount: 200,
      timestamp: expect.any(Date),
    });
  });

  it('should emit ping', () => {
    gateway.sendPing();
    expect(mockClientProxy.emit).toHaveBeenCalledWith('ping', {});
  });

  it('should close room and notify users', () => {
    gateway.closeRoom(500, 'room3');
    expect(mockServer.to).toHaveBeenCalledWith('room3');
    expect(mockServer.emit).toHaveBeenCalledWith(
      'auction.close',
      'This room is closed, the final price is 500. You can leave this room, thank you !'
    );
  });
});
