import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Logger } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { firstValueFrom } from 'rxjs';
import { Server, Socket } from 'socket.io';

interface Bid {
  amount: number;
  timestamp: Date;
  userId: string;
}

interface AuctionRoom {
  bids: Bid[];
  closeTimeout: NodeJS.Timeout;
  currentHighestBid: Bid | null;
  warningTimeout: NodeJS.Timeout;
}

@WebSocketGateway()
export class AuctionGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  private readonly logger = new Logger(AuctionGateway.name);
  private activeRooms: Map<string, AuctionRoom> = new Map();
  // private readonly ROOM_TIMEOUT = 3600000;
  private readonly ROOM_TIMEOUT = 30_000;
  private readonly WARNING_DELAY = 5000;

  constructor(
    @Inject('NATS_SERVICES') private client: ClientProxy,
    @Inject(CACHE_MANAGER) private cacheManager: Cache
  ) {}

  @WebSocketServer() io: Server;

  afterInit() {
    this.logger.log('Initialized');
  }

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('join-room')
  async joinRoom(client: Socket, auctionId: string) {
    this.logger.log(`User ${client.id} joining auction: ${auctionId}`);

    // Récupérer ou créer l'ID de la room depuis Redis
    let roomId = await this.cacheManager.get(`auction:${auctionId}:room`);
    if (!roomId) {
      roomId = `room:${auctionId}:${Date.now()}`;
      await this.cacheManager.set(`auction:${auctionId}:room`, roomId, 0);
    }

    await client.join(roomId as string);
    this.io
      .to(roomId as string[] | string)
      .emit('new-user', `User ${client.id} connected`);

    if (!this.activeRooms.has(roomId as string)) {
      this.startRoomTimers(roomId as string);
    }
  }

  @SubscribeMessage('place-bid')
  async placeBid(client: Socket, data: { amount: number; auctionId: string }) {
    const { auctionId, amount } = data;

    // Récupérer l'ID de la room depuis Redis
    const roomId = await this.cacheManager.get(`auction:${auctionId}:room`);
    if (!roomId) {
      client.emit('error', 'Auction not found');
      return;
    }

    const auctionRoom = this.activeRooms.get(roomId as string);
    if (!auctionRoom) {
      client.emit('error', 'Room not found');
      return;
    }

    try {
      const result = await firstValueFrom(
        this.client.send('place-bid', {
          amount,
          room: roomId,
          clientId: client.id,
        })
      );
      if (result) {
        this.handleBidResponse(result);
      }
    } catch (error) {
      client.emit('error', 'Failed to place bid');
      this.logger.error('Error placing bid:', error);
    }
  }

  handleBidResponse(data: { amount: number; room: string }) {
    const { room, amount } = data;
    this.io.to(room).emit('bid-processed', {
      amount,
      timestamp: new Date(),
    });
  }

  @SubscribeMessage('ping')
  sendPing() {
    this.client.emit('ping', {});
  }

  handleAuctionPong() {
    this.io.emit('auction-pong', 'pong');
  }

  @SubscribeMessage('close-room')
  closeRoom(room: string) {
    this.logger.log(`Closing room: ${room}`);

    const auctionRoom = this.activeRooms.get(room);
    if (auctionRoom) {
      const winner = auctionRoom.currentHighestBid;
      if (winner) {
        this.io.to(room).emit('auction-ended', {
          winner: winner.userId,
          winningAmount: winner.amount,
          timestamp: winner.timestamp,
        });
      } else {
        this.io
          .to(room)
          .emit('auction-ended', { message: 'No bids were placed' });
      }
    }

    this.clearRoomTimers(room);
    this.io.to(room).emit('room-closed', 'Room is being closed');
    this.io.in(room).socketsLeave(room);
  }

  private startRoomTimers(room: string) {
    const warningTimeout = setTimeout(() => {
      this.io.to(room).emit('room-will-close', 'Room will close in 2 seconds');
    }, this.ROOM_TIMEOUT - this.WARNING_DELAY);

    const closeTimeout = setTimeout(() => {
      this.closeRoom(room);
    }, this.ROOM_TIMEOUT);

    this.activeRooms.set(room, {
      closeTimeout,
      warningTimeout,
      bids: [],
      currentHighestBid: null,
    });
  }

  private clearRoomTimers(room: string) {
    const timers = this.activeRooms.get(room);
    if (timers) {
      clearTimeout(timers.warningTimeout);
      clearTimeout(timers.closeTimeout);
      this.activeRooms.delete(room);
    }
  }

  private resetRoomTimer(room: string) {
    this.clearRoomTimers(room);
    this.startRoomTimers(room);
  }
}
