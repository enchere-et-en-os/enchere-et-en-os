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
import { Server, Socket } from 'socket.io';

@WebSocketGateway()
export class AuctionGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  private readonly logger = new Logger(AuctionGateway.name);

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

  @SubscribeMessage('ping')
  sendPing() {
    this.client.emit('ping', {});
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
  async placeBid(
    client: Socket,
    data: { amount: number; auctionId: string; userId: string }
  ) {
    const { auctionId, amount } = data;

    this.client.send('place-bid', {
      amount,
      auctionId: auctionId,
      clientId: client.id,
    });
  }

  // Function call when NATS send event for WS

  handleBidResponse(data: { amount: number; room: string }) {
    const { room, amount } = data;
    this.io.to(room).emit('bid-processed', {
      amount,
      timestamp: new Date(),
    });
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
