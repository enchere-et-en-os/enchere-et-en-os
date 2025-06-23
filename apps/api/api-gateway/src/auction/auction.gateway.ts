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

    await client.join(auctionId as string);
    this.io
      .to(auctionId as string[] | string)
      .emit('new-user', `User ${client.id} connected`);
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

  closeRoom(finalPrice: number, roomId: string) {
    this.io
      .to(roomId)
      .emit(
        'auction.close',
        'This room is closed, the final price is ' +
          finalPrice +
          '. You can leave this room, thank you !'
      );
  }
}
