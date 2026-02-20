import { Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import * as cookie from 'cookie';
import { Server, Socket } from 'socket.io';

import { AuthGateway } from './auth.gateway';

jest.mock('cookie');
// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
const mockedCookie: any = cookie;

describe('AuthGateway', () => {
  let gateway: AuthGateway;
  let jwtService: JwtService;

  const joinSpy = jest.fn().mockResolvedValue(undefined);
  const disconnectSpy = jest.fn();

  const mockSocket = {
    handshake: {
      headers: {
        cookie: 'access_token=validToken',
      },
    },
    disconnect: disconnectSpy,
    join: joinSpy,
    id: 'socket-id',
    data: {},
  } as unknown as Socket;

  const emitSpy = jest.fn();
  const toSpy = jest.fn().mockReturnValue({ emit: emitSpy });

  const mockServer = {
    to: toSpy,
    emit: emitSpy,
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
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    (gateway as any).server = mockServer;
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });

  describe('handleConnection', () => {
    it('should disconnect if no cookies are present', async () => {
      const localDisconnect = jest.fn();
      const client = {
        handshake: { headers: {} },
        disconnect: localDisconnect,
      } as unknown as Socket;

      await gateway.handleConnection(client);
      expect(localDisconnect).toHaveBeenCalled();
    });

    it('should disconnect if access_token cookie is missing', async () => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
      mockedCookie.parse.mockReturnValue({});
      const localDisconnect = jest.fn();
      const client = {
        handshake: { headers: { cookie: 'other=value' } },
        disconnect: localDisconnect,
      } as unknown as Socket;

      await gateway.handleConnection(client);
      expect(localDisconnect).toHaveBeenCalled();
    });

    it('should authenticate and join room on valid token', async () => {
      const payload = { sub: 'user-123' };
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
      mockedCookie.parse.mockReturnValue({ access_token: 'valid' });
      jest.spyOn(jwtService, 'verify').mockReturnValue(payload);

      await gateway.handleConnection(mockSocket);

      expect((mockSocket.data as { userId: string }).userId).toBe('user-123');
      expect(joinSpy).toHaveBeenCalledWith('user-123');
      expect(emitSpy).toHaveBeenCalledWith(
        'ONLINE_USERS_UPDATE',
        expect.any(Object),
      );
    });

    it('should disconnect on JWT verification failure', async () => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
      mockedCookie.parse.mockReturnValue({ access_token: 'invalid' });
      jest.spyOn(jwtService, 'verify').mockImplementation(() => {
        throw new Error('invalid token');
      });

      await gateway.handleConnection(mockSocket);
      expect(disconnectSpy).toHaveBeenCalled();
    });
  });

  describe('handleDisconnect', () => {
    it('should handle disconnect for authenticated user', async () => {
      // First connect to populate onlineUsers
      const payload = { sub: 'user-123' };
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
      mockedCookie.parse.mockReturnValue({ access_token: 'valid' });
      jest.spyOn(jwtService, 'verify').mockReturnValue(payload);
      await gateway.handleConnection(mockSocket);

      // Then disconnect
      gateway.handleDisconnect(mockSocket);

      expect(emitSpy).toHaveBeenCalledWith(
        'ONLINE_USERS_UPDATE',
        expect.objectContaining({ count: 0 }),
      );
    });

    it('should log warning if userId is missing on disconnect', () => {
      const loggerSpy = jest.spyOn(Logger.prototype, 'warn');
      const localClient = { id: 'some-id', data: {} } as unknown as Socket;
      gateway.handleDisconnect(localClient);
      expect(loggerSpy).toHaveBeenCalledWith(
        expect.stringContaining('Disconnect without userId'),
      );
    });
  });

  describe('emitTokenExpiring', () => {
    it('should emit TOKEN_EXPIRING event to user room', () => {
      gateway.emitTokenExpiring('user-123');
      expect(toSpy).toHaveBeenCalledWith('user-123');
      expect(emitSpy).toHaveBeenCalledWith('TOKEN_EXPIRING');
    });
  });
});
