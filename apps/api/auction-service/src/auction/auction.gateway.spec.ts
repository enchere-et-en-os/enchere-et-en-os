import { type INestApplication, type Provider } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { io, type Socket } from 'socket.io-client';

import { AuctionGateway } from './auction.gateway';

/**
 *
 */
async function createNestApp(
  ...gateways: Provider[]
): Promise<INestApplication> {
  const testingModule = await Test.createTestingModule({
    providers: gateways,
  }).compile();
  return testingModule.createNestApplication();
}

describe('AuctionGateway', () => {
  let gateway: AuctionGateway;
  let app: INestApplication;
  let ioClient: Socket;

  beforeAll(async () => {
    // Instantiate the app
    app = await createNestApp(AuctionGateway);
    // Get the gateway instance from the app instance
    gateway = app.get<AuctionGateway>(AuctionGateway);
    // Create a new client that will interact with the gateway
    ioClient = io('http://localhost:3000', {
      autoConnect: false,
      transports: ['websocket', 'polling'],
    });

    await app.listen(3000);
  });

  afterAll(async () => {
    await app.close();
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });

  it('should emit "pong" on "ping"', async () => {
    ioClient.connect();
    ioClient.emit('ping', 'Hello world!');
    await new Promise<void>((resolve) => {
      ioClient.on('connect', () => {
        console.log('connected');
      });
      ioClient.on('pong', (data) => {
        expect(data).toBe('Hello world!');
        resolve();
      });
    });
    ioClient.disconnect();
  });
});
