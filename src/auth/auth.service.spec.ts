import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import * as bcrypt from 'bcryptjs';
import { Types } from 'mongoose';

import { User, UserRole } from '../users/schemas/user.schema';
import { AuthService } from './auth.service';
import { RefreshToken } from './schemas/refresh-token.schema';
import { TokenExpiryService } from './token-expiry.service';

describe('AuthService', () => {
  let service: AuthService;
  let userModel: typeof MockUserModel;
  let refreshTokenModel: {
    findOne: jest.Mock;
    create: jest.Mock;
    deleteOne: jest.Mock;
    deleteMany: jest.Mock;
  };
  let tokenExpiryService: TokenExpiryService;

  const mockUser = {
    _id: new Types.ObjectId(),
    email: 'test@example.com',
    password: 'hashedPassword',
    role: UserRole.USER,
    name: 'Test User',
  };

  const mockRefreshToken = {
    _id: new Types.ObjectId(),
    userId: mockUser._id,
    tokenId: 'some-uuid',
    tokenHash: 'hashedSecret',
    expiresAt: new Date(Date.now() + 10000),
  };

  class MockUserModel {
    _id = mockUser._id;
    constructor(private data: any) {
      Object.assign(this, data);
    }
    save = jest.fn().mockResolvedValue({ ...mockUser, ...this });
    static findOne = jest.fn();
    static findById = jest.fn();
  }

  const mockRefreshTokenModel = {
    findOne: jest.fn(),
    create: jest.fn(),
    deleteOne: jest.fn(),
    deleteMany: jest.fn(),
  };

  const mockJwtService = {
    signAsync: jest.fn().mockResolvedValue('access-token'),
    decode: jest
      .fn()
      .mockReturnValue({ exp: Math.floor(Date.now() / 1000) + 3600 }),
  };

  const mockTokenExpiryService = {
    scheduleTokenExpiryWarning: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getModelToken(User.name),
          useValue: MockUserModel,
        },
        {
          provide: getModelToken(RefreshToken.name),
          useValue: mockRefreshTokenModel,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: TokenExpiryService,
          useValue: mockTokenExpiryService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userModel = MockUserModel;
    refreshTokenModel = module.get(getModelToken(RefreshToken.name));
    tokenExpiryService = module.get<TokenExpiryService>(TokenExpiryService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('register', () => {
    it('should register a new user', async () => {
      userModel.findOne.mockResolvedValue(null);
      const registerDto = {
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
      };

      const result = await service.register(registerDto);

      expect(result).toBeDefined();
      expect(result.access_token).toBe('access-token');
      expect(userModel.findOne).toHaveBeenCalledWith({
        email: registerDto.email,
      });
    });

    it('should throw ConflictException if user exists', async () => {
      userModel.findOne.mockResolvedValue(mockUser);
      const registerDto = {
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
      };

      await expect(service.register(registerDto)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('login', () => {
    it('should login a user with valid credentials', async () => {
      const hashedPassword = await bcrypt.hash('password123', 10);
      userModel.findOne.mockResolvedValue({
        ...mockUser,
        password: hashedPassword,
        save: jest.fn().mockResolvedValue(true),
      });

      const loginDto = {
        email: 'test@example.com',
        password: 'password123',
      };

      const result = await service.login(loginDto);

      expect(result).toBeDefined();
      expect(result.access_token).toBe('access-token');
      expect(
        tokenExpiryService['scheduleTokenExpiryWarning'],
      ).toHaveBeenCalled();
    });

    it('should throw UnauthorizedException for invalid credentials', async () => {
      userModel.findOne.mockResolvedValue(null);
      const loginDto = {
        email: 'test@example.com',
        password: 'password123',
      };

      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('logout', () => {
    it('should delete refresh tokens for the user', async () => {
      const userId = mockUser._id.toHexString();
      const result = await service.logout(userId);

      expect(result).toEqual({ message: 'Logout successful' });
      expect(refreshTokenModel['deleteMany']).toHaveBeenCalled();
    });
  });

  describe('refreshTokens', () => {
    it('should return new tokens for valid refresh token', async () => {
      const refreshToken = 'token-id:secret';
      refreshTokenModel.findOne.mockResolvedValue({
        ...mockRefreshToken,
        tokenHash: await bcrypt.hash('secret', 10),
      });
      userModel.findById.mockResolvedValue(mockUser);

      const result = await service.refreshTokens(refreshToken);

      expect(result).toBeDefined();
      expect(result.access_token).toBe('access-token');
      expect(refreshTokenModel['deleteOne']).toHaveBeenCalled();
    });
  });
});
