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

  constructor(@Inject('NATS_SERVICES') private client: ClientProxy) {}

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
  async joinRoom(client: Socket, room: string) {
    this.logger.log(`User ${client.id} joining room: ${room}`);
    await client.join(room);
    this.io.to(room).emit('new-user', `User ${client.id} connected`);

    if (!this.activeRooms.has(room)) {
      this.startRoomTimers(room);
    }
  }

  @SubscribeMessage('place-bid')
  placeBid(client: Socket, data: { amount: number; room: string }) {
    const { room, amount } = data;
    const auctionRoom = this.activeRooms.get(room);

    if (!auctionRoom) {
      client.emit('error', 'Room not found');
      return;
    }

    const newBid: Bid = {
      userId: client.id,
      amount,
      timestamp: new Date(),
    };

    if (
      !auctionRoom.currentHighestBid ||
      amount > auctionRoom.currentHighestBid.amount
    ) {
      auctionRoom.currentHighestBid = newBid;
      auctionRoom.bids.push(newBid);
      this.io.to(room).emit('new-highest-bid', {
        userId: client.id,
        amount,
        timestamp: newBid.timestamp,
      });
    } else {
      client.emit(
        'bid-rejected',
        'Your bid is not higher than the current highest bid'
      );
    }
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
