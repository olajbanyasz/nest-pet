import { Test, TestingModule } from '@nestjs/testing';
import { Request, Response } from 'express';

import { UserRole } from '../users/schemas/user.schema';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController', () => {
  let controller: AuthController;

  const mockUser = {
    _id: 'user-id',
    email: 'test@example.com',
    role: UserRole.USER,
    name: 'Test User',
  };

  const mockAuthService = {
    register: jest.fn().mockResolvedValue({
      access_token: 'access-token',
      refresh_token: 'refresh-token',
      user: mockUser,
    }),
    login: jest.fn().mockResolvedValue({
      access_token: 'access-token',
      refresh_token: 'refresh-token',
      user: mockUser,
    }),
    refreshTokens: jest.fn().mockResolvedValue({
      access_token: 'new-access-token',
      refresh_token: 'new-refresh-token',
    }),
    logout: jest.fn().mockResolvedValue({ message: 'Logout successful' }),
  };

  const createMockResponse = () => {
    const res = {
      cookie: jest.fn(),
      clearCookie: jest.fn(),
      status: jest.fn(),
      json: jest.fn(),
    };
    res.cookie.mockReturnValue(res);
    res.clearCookie.mockReturnValue(res);
    res.status.mockReturnValue(res);
    res.json.mockReturnValue(res);
    return res as unknown as Response;
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('register', () => {
    it('should register a user and set cookies', async () => {
      const res = createMockResponse();
      const dto = {
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
      };
      const result = await controller.register(dto, res);

      expect(result).toBeDefined();
      expect(res['cookie']).toHaveBeenCalledTimes(2);
    });
  });

  describe('login', () => {
    it('should login a user and set cookies', async () => {
      const res = createMockResponse();
      const dto = { email: 'test@example.com', password: 'password123' };
      const result = await controller.login(dto, res);

      expect(result).toBeDefined();
      expect(res['cookie']).toHaveBeenCalledTimes(2);
    });
  });

  describe('refresh', () => {
    it('should refresh tokens and update cookies', async () => {
      const res = createMockResponse();
      const req = {
        cookies: { refresh_token: 'old-refresh-token' },
      } as unknown as Request;

      const result = await controller.refresh(req, res);

      expect(result).toBeDefined();
      expect(res['cookie']).toHaveBeenCalledTimes(2);
    });
  });

  describe('logout', () => {
    it('should call logout and clear cookies', async () => {
      const res = createMockResponse();
      const req = {
        user: { userId: 'user-id' },
      } as unknown as Request;

      const result = await controller.logout(req, res);

      expect(result).toEqual({ message: 'Logout successful' });
      expect(res['clearCookie']).toHaveBeenCalledTimes(2);
      expect(mockAuthService.logout).toHaveBeenCalledWith('user-id');
    });
  });

  describe('getCsrfToken', () => {
    it('should return csrf token from request', () => {
      const req = {
        csrfToken: jest.fn().mockReturnValue('mock-csrf-token'),
      } as unknown as Request;

      const result = controller.getCsrfToken(req);
      expect(result).toEqual({ csrfToken: 'mock-csrf-token' });
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(req.csrfToken).toHaveBeenCalled();
    });

    it('should return empty string if csrfToken is not available', () => {
      const req = {} as unknown as Request;
      const result = controller.getCsrfToken(req);
      expect(result).toEqual({ csrfToken: '' });
    });
  });
});
