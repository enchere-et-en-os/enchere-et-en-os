import { OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';

@WebSocketGateway()
export class AuctionGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  private readonly logger = new Logger(AuctionGateway.name);
  private activeRooms: Map<string, { closeTimeout: NodeJS.Timeout, warningTimeout: NodeJS.Timeout }> = new Map();
  // private readonly ROOM_TIMEOUT = 3600000;
  private readonly ROOM_TIMEOUT = 10000;
  private readonly WARNING_DELAY = 5000;

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

  @SubscribeMessage("join-room")
  joinRoom(client: Socket, room: string) {
    this.logger.log(`User ${client.id} joining room: ${room}`);
    client.join(room);
    this.io.to(room).emit("new-user", `User ${client.id} connected`);

    if (!this.activeRooms.has(room)) {
      this.startRoomTimers(room);
    }
  }

  @SubscribeMessage("close-room")
  closeRoom(room: string) {
    this.logger.log(`Closing room: ${room}`);
    
    this.clearRoomTimers(room);

    this.io.to(room).emit("room-closed", "Room is being closed");
    this.io.in(room).socketsLeave(room);
  }

  private startRoomTimers(room: string) {
    const warningTimeout = setTimeout(() => {
      this.io.to(room).emit("room-will-close", "Room will close in 2 seconds");
    }, this.ROOM_TIMEOUT - this.WARNING_DELAY);

    const closeTimeout = setTimeout(() => {
      this.closeRoom(room);
    }, this.ROOM_TIMEOUT);

    this.activeRooms.set(room, { closeTimeout, warningTimeout });
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
