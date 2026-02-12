/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unused-vars */
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
  private onlineUsers = new Map<string, Set<string>>();

  @WebSocketServer()
  private server!: Server;

  constructor(private readonly jwtService: JwtService) {}

  async handleConnection(client: Socket): Promise<void> {
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
      client.data.userId = userId;

      await client.join(userId);

      const existingSockets = this.onlineUsers.get(userId);

      if (existingSockets) {
        existingSockets.add(client.id);
      } else {
        this.onlineUsers.set(userId, new Set([client.id]));
      }

      this.logger.log(
        `WS connected: user=${userId}, totalOnline=${this.onlineUsers.size}`,
      );

      this.broadcastOnlineUsers();
    } catch (err) {
      this.logger.warn('WS auth failed');
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket): void {
    const userId = client.data?.userId as string | undefined;

    if (!userId) {
      this.logger.warn(`Disconnect without userId, socket=${client.id}`);
      return;
    }

    const userSockets = this.onlineUsers.get(userId);

    if (userSockets) {
      userSockets.delete(client.id);

      if (userSockets.size === 0) {
        this.onlineUsers.delete(userId);
      }
    }

    this.logger.log(
      `WS disconnected: user=${userId}, totalOnline=${this.onlineUsers.size}`,
    );

    this.broadcastOnlineUsers();
  }

  emitTokenExpiring(userId: string): void {
    this.server.to(userId).emit('TOKEN_EXPIRING');
  }

  private broadcastOnlineUsers(): void {
    this.server.emit('ONLINE_USERS_UPDATE', {
      users: Array.from(this.onlineUsers.keys()),
      count: this.onlineUsers.size,
    });
  }
}
