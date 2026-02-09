/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { JwtService } from '@nestjs/jwt';
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import * as cookie from 'cookie';

interface JwtPayload {
  sub: string;
  exp: number;
  role?: string;
}

@WebSocketGateway({
  cors: {
    origin: ['http://localhost:3000', 'http://localhost:8000'],
    credentials: true,
  },
})
export class AuthGateway implements OnGatewayConnection, OnGatewayDisconnect {
  private readonly logger = new Logger(AuthGateway.name);

  @WebSocketServer()
  private server!: Server;

  constructor(private readonly jwtService: JwtService) {}

  handleConnection(client: Socket): void {
    try {
      const rawCookie = client.handshake.headers.cookie;
      if (!rawCookie) {
        this.logger.warn('WS connection rejected: no cookies');
        client.disconnect();
        return;
      }

      const parsed = cookie.parse(rawCookie);
      const token = parsed['access_token'];

      if (!token) {
        this.logger.warn('WS connection rejected: missing access_token cookie');
        client.disconnect();
        return;
      }

      const payload = this.jwtService.verify<JwtPayload>(token);
      const userId = payload.sub;

      client.join(userId);
      this.logger.log(`WS connected: user=${userId}`);
    } catch (err) {
      this.logger.warn('WS auth failed');
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket): void {
    this.logger.log(`WS disconnected: ${client.id}`);
  }

  emitTokenExpiring(userId: string): void {
    this.server.to(userId).emit('TOKEN_EXPIRING');
  }
}
