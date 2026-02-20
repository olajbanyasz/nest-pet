import { Test, TestingModule } from '@nestjs/testing';
import { Request } from 'express';

import { UserRole } from '../users/schemas/user.schema';
import { JwtPayload, JwtStrategy } from './jwt.strategy';

describe('JwtStrategy', () => {
  let strategy: JwtStrategy;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [JwtStrategy],
    }).compile();

    strategy = module.get<JwtStrategy>(JwtStrategy);
  });

  it('should be defined', () => {
    expect(strategy).toBeDefined();
  });

  describe('validate', () => {
    it('should return user info from payload', () => {
      const payload: JwtPayload = {
        sub: 'user-123',
        email: 'test@example.com',
        role: UserRole.USER,
        name: 'Test User',
      };

      const result = strategy.validate(payload);

      expect(result).toEqual({
        userId: 'user-123',
        email: 'test@example.com',
        role: UserRole.USER,
        name: 'Test User',
      });
    });
  });

  describe('cookieExtractor', () => {
    it('should initialize without error', () => {
      // The strategy is initialized in beforeEach
      // We can verify it exists and wait for more specific tests if needed
      expect(strategy).toBeDefined();
    });
  });
});
