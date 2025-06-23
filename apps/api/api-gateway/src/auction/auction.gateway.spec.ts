import type { Cache } from '@nestjs/cache-manager';
import type { ClientProxy } from '@nestjs/microservices';
import type { Server, Socket } from 'socket.io';

import { Logger } from '@nestjs/common';
import { of, throwError } from 'rxjs';
import { beforeEach, describe, expect, it, type Mock, vi } from 'vitest';

import { AuctionGateway } from './auction.gateway';

// A single bid structure
interface Bid {
  amount: number;
  timestamp: Date;
  userId: string;
}

// Internal server-side structure for an auction room
interface AuctionRoom {
  bids: Bid[];
  closeTimeout: NodeJS.Timeout | null;
  currentHighestBid: Bid | null;
  warningTimeout: NodeJS.Timeout | null;
}

// Properly typed mocks for ClientProxy, Cache, Socket, and Server
interface MockedClientProxy extends Pick<ClientProxy, 'emit' | 'send'> {
  emit: Mock;
  send: Mock;
}

interface MockedCache extends Pick<Cache, 'get'> {
  get: Mock;
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

  // -------------------------------
  // Setup fresh mocks before each test
  // -------------------------------
  beforeEach(() => {
    // Mock NATS ClientProxy
    mockClientProxy = {
      send: vi.fn(),
      emit: vi.fn(),
    };

    // Mock Redis/Cache Manager
    mockCacheManager = {
      get: vi.fn(),
    };

    // Mock Socket.IO Server
    mockServer = {
      to: vi.fn().mockReturnThis(),
      emit: vi.fn(),
    };

    // Create the gateway instance with the mocks
    gateway = new AuctionGateway(
      mockClientProxy as unknown as ClientProxy,
      mockCacheManager as unknown as Cache
    );
    // Inject mocked server into the gateway
    gateway.io = mockServer as unknown as Server;

    // Mock a connected socket
    mockSocket = {
      id: 'client123',
      join: vi.fn(),
      emit: vi.fn(),
    };

    // Disable actual logging during tests
    vi.spyOn(Logger.prototype, 'log').mockImplementation(() => {});
    vi.spyOn(Logger.prototype, 'error').mockImplementation(() => {});
  });

  // Test: Initialization logs
  it('should log after initialization', () => {
    gateway.afterInit();
    expect(Logger.prototype.log).toHaveBeenCalledWith('Initialized');
  });

  // Test: New client connection
  it('should log connection', () => {
    gateway.handleConnection(mockSocket as unknown as Socket);
    expect(Logger.prototype.log).toHaveBeenCalledWith(
      `Client connected: ${mockSocket.id}`
    );
  });

  // Test: Client disconnection
  it('should log disconnection', () => {
    gateway.handleDisconnect(mockSocket as unknown as Socket);
    expect(Logger.prototype.log).toHaveBeenCalledWith(
      `Client disconnected: ${mockSocket.id}`
    );
  });

  // Test: Client joins an auction room
  it('should join room and notify others', async () => {
    await gateway.joinRoom(mockSocket as unknown as Socket, 'auction1');

    // Should join the Socket.IO room
    expect(mockSocket.join).toHaveBeenCalledWith('auction1');

    // Should broadcast new user joined event
    expect(mockServer.to).toHaveBeenCalledWith('auction1');
    expect(mockServer.emit).toHaveBeenCalledWith(
      'new-user',
      `User ${mockSocket.id} connected`
    );
  });

  // Test: Successful bid placement
  it('should handle placeBid with valid room and success', async () => {
    // Mock cache to return an existing room ID
    mockCacheManager.get.mockResolvedValue('room1');

    // Register a live auction room in memory
    const auctionRoom: AuctionRoom = {
      bids: [],
      closeTimeout: null,
      currentHighestBid: null,
      warningTimeout: null,
    };
    gateway['activeRooms'].set('room1', auctionRoom);

    // Spy on bid response handler
    vi.spyOn(gateway, 'handleBidResponse');

    // Mock NATS send to resolve normally
    mockClientProxy.send.mockReturnValue(of({ amount: 100, room: 'room1' }));

    await gateway.placeBid(mockSocket as unknown as Socket, {
      amount: 100,
      auctionId: 'auction1',
    });

    // Should process bid response
    expect(gateway.handleBidResponse).toHaveBeenCalledWith({
      amount: 100,
      room: 'room1',
    });
  });

  // Test: Bid placement fails when auction not in cache
  it('should emit error if auction not found in cache', async () => {
    mockCacheManager.get.mockResolvedValue(null);

    await gateway.placeBid(mockSocket as unknown as Socket, {
      amount: 50,
      auctionId: 'auctionX',
    });

    expect(mockSocket.emit).toHaveBeenCalledWith('error', 'Auction not found');
  });

  // Test: Bid placement fails when room is missing
  it('should emit error if room not found in activeRooms', async () => {
    mockCacheManager.get.mockResolvedValue('roomX');

    await gateway.placeBid(mockSocket as unknown as Socket, {
      amount: 80,
      auctionId: 'auctionY',
    });

    expect(mockSocket.emit).toHaveBeenCalledWith('error', 'Room not found');
  });

  // Test: Bid placement fails when NATS throws error
  it('should emit error if placeBid throws error', async () => {
    mockCacheManager.get.mockResolvedValue('room1');

    gateway['activeRooms'].set('room1', {
      bids: [],
      closeTimeout: null,
      currentHighestBid: null,
      warningTimeout: null,
    } as AuctionRoom);

    mockClientProxy.send.mockReturnValue(
      throwError(() => new Error('NATS error'))
    );

    await gateway.placeBid(mockSocket as unknown as Socket, {
      amount: 100,
      auctionId: 'auction1',
    });

    expect(mockSocket.emit).toHaveBeenCalledWith(
      'error',
      'Failed to place bid'
    );
    expect(Logger.prototype.error).toHaveBeenCalled();
  });

  // Test: handleBidResponse pushes event to room
  it('should handle bid response', () => {
    gateway.handleBidResponse({ amount: 200, room: 'room2' });
    expect(mockServer.to).toHaveBeenCalledWith('room2');
    expect(mockServer.emit).toHaveBeenCalledWith('bid-processed', {
      amount: 200,
      timestamp: expect.any(Date),
    });
  });

  // Test: sendPing should emit ping event to NATS
  it('should emit ping', () => {
    gateway.sendPing();
    expect(mockClientProxy.emit).toHaveBeenCalledWith('ping', {});
  });

  // Test: closeRoom should broadcast close message
  it('should close room and notify users', () => {
    gateway.closeRoom(500, 'room3');
    expect(mockServer.to).toHaveBeenCalledWith('room3');
    expect(mockServer.emit).toHaveBeenCalledWith(
      'auction.close',
      'This room is closed, the final price is 500. You can leave this room, thank you !'
    );
  });
});
