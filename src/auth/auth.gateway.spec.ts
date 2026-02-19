import { Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import * as cookie from 'cookie';
import { Server, Socket } from 'socket.io';

import { AuthGateway } from './auth.gateway';

jest.mock('cookie');

describe('AuthGateway', () => {
  let gateway: AuthGateway;
  let jwtService: JwtService;

  const mockSocket = {
    handshake: {
      headers: {
        cookie: 'access_token=validToken',
      },
    },
    disconnect: jest.fn(),
    join: jest.fn().mockResolvedValue(undefined),
    id: 'socket-id',
    data: {},
  } as unknown as Socket;

  const mockServer = {
    to: jest.fn().mockReturnThis(),
    emit: jest.fn(),
  } as unknown as Server;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthGateway,
        {
          provide: JwtService,
          useValue: {
            verify: jest.fn(),
          },
        },
      ],
    }).compile();

    gateway = module.get<AuthGateway>(AuthGateway);
    jwtService = module.get<JwtService>(JwtService);
    (gateway as any).server = mockServer;
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });

  describe('handleConnection', () => {
    it('should disconnect if no cookies are present', async () => {
      const client = {
        handshake: { headers: {} },
        disconnect: jest.fn(),
      } as any;

      await gateway.handleConnection(client);
      expect(client.disconnect).toHaveBeenCalled();
    });

    it('should disconnect if access_token cookie is missing', async () => {
      (cookie.parse as jest.Mock).mockReturnValue({});
      const client = {
        handshake: { headers: { cookie: 'other=value' } },
        disconnect: jest.fn(),
      } as any;

      await gateway.handleConnection(client);
      expect(client.disconnect).toHaveBeenCalled();
    });

    it('should authenticate and join room on valid token', async () => {
      const payload = { sub: 'user-123' };
      (cookie.parse as jest.Mock).mockReturnValue({ access_token: 'valid' });
      jest.spyOn(jwtService, 'verify').mockReturnValue(payload);

      await gateway.handleConnection(mockSocket);

      expect(mockSocket.data.userId).toBe('user-123');
      expect(mockSocket.join).toHaveBeenCalledWith('user-123');
      expect(mockServer.emit).toHaveBeenCalledWith(
        'ONLINE_USERS_UPDATE',
        expect.any(Object),
      );
    });

    it('should disconnect on JWT verification failure', async () => {
      (cookie.parse as jest.Mock).mockReturnValue({ access_token: 'invalid' });
      jest.spyOn(jwtService, 'verify').mockImplementation(() => {
        throw new Error('invalid token');
      });

      await gateway.handleConnection(mockSocket);
      expect(mockSocket.disconnect).toHaveBeenCalled();
    });
  });

  describe('handleDisconnect', () => {
    it('should handle disconnect for authenticated user', async () => {
      // First connect to populate onlineUsers
      const payload = { sub: 'user-123' };
      (cookie.parse as jest.Mock).mockReturnValue({ access_token: 'valid' });
      jest.spyOn(jwtService, 'verify').mockReturnValue(payload);
      await gateway.handleConnection(mockSocket);

      // Then disconnect
      gateway.handleDisconnect(mockSocket);

      expect(mockServer.emit).toHaveBeenCalledWith(
        'ONLINE_USERS_UPDATE',
        expect.objectContaining({ count: 0 }),
      );
    });

    it('should log warning if userId is missing on disconnect', () => {
      const loggerSpy = jest.spyOn(Logger.prototype, 'warn');
      const client = { id: 'some-id', data: {} } as any;
      gateway.handleDisconnect(client);
      expect(loggerSpy).toHaveBeenCalledWith(
        expect.stringContaining('Disconnect without userId'),
      );
    });
  });

  describe('emitTokenExpiring', () => {
    it('should emit TOKEN_EXPIRING event to user room', () => {
      gateway.emitTokenExpiring('user-123');
      expect(mockServer.to).toHaveBeenCalledWith('user-123');
      expect(mockServer.emit).toHaveBeenCalledWith('TOKEN_EXPIRING');
    });
  });
});
