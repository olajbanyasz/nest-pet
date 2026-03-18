import { Test, TestingModule } from '@nestjs/testing';

import { AuthGateway } from './auth.gateway';
import { TokenExpiryService } from './token-expiry.service';

describe('TokenExpiryService', () => {
  let service: TokenExpiryService;
  let authGateway: {
    emitTokenExpiring: jest.Mock;
    emitForceLogout: jest.Mock;
  };

  beforeEach(async () => {
    authGateway = {
      emitTokenExpiring: jest.fn(),
      emitForceLogout: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TokenExpiryService,
        {
          provide: AuthGateway,
          useValue: authGateway,
        },
      ],
    }).compile();

    service = module.get<TokenExpiryService>(TokenExpiryService);
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
    delete process.env.TOKEN_WARNING_DELAY_MS;
    delete process.env.TOKEN_LOGOUT_DELAY_MS;
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('scheduleTokenExpiryWarning', () => {
    it('should schedule a warning and emit event when timeout expires', () => {
      const userId = 'user1';
      const expiresIn = 60000; // 60s
      const expectedDelay = expiresIn - 30000; // 30s

      service.scheduleTokenExpiryWarning(userId, expiresIn);

      expect(authGateway.emitTokenExpiring).not.toHaveBeenCalled();

      jest.advanceTimersByTime(expectedDelay);

      expect(authGateway.emitTokenExpiring).toHaveBeenCalledWith(userId);
    });

    it('should clear existing timeout when scheduling a new one', () => {
      const userId = 'user1';
      service.scheduleTokenExpiryWarning(userId, 60000);

      const clearTimeoutSpy = jest.spyOn(global, 'clearTimeout');

      service.scheduleTokenExpiryWarning(userId, 120000);

      expect(clearTimeoutSpy).toHaveBeenCalled();
    });

    it('should use TOKEN_WARNING_DELAY_MS if provided', () => {
      process.env.TOKEN_WARNING_DELAY_MS = '5000';
      const userId = 'user1';

      service.scheduleTokenExpiryWarning(userId, 60000);

      jest.advanceTimersByTime(4999);
      expect(authGateway.emitTokenExpiring).not.toHaveBeenCalled();

      jest.advanceTimersByTime(1);
      expect(authGateway.emitTokenExpiring).toHaveBeenCalledWith(userId);
    });

    it('should skip scheduling if warningDelay <= 0', () => {
      const userId = 'user1';
      service.scheduleTokenExpiryWarning(userId, 10000); // 10s -> delay = -20s

      expect(jest.getTimerCount()).toBe(0);
    });
  });

  describe('force-logout scheduling', () => {
    it('should schedule FORCE_LOGOUT after TOKEN_EXPIRING fires', () => {
      const userId = 'user1';
      service.scheduleTokenExpiryWarning(userId, 60000);

      // Advance to fire TOKEN_EXPIRING (30s delay)
      jest.advanceTimersByTime(30000);
      expect(authGateway.emitTokenExpiring).toHaveBeenCalledWith(userId);
      expect(authGateway.emitForceLogout).not.toHaveBeenCalled();

      // Advance to fire FORCE_LOGOUT (default 10 min)
      jest.advanceTimersByTime(10 * 60 * 1000);
      expect(authGateway.emitForceLogout).toHaveBeenCalledWith(userId);
    });

    it('should use TOKEN_LOGOUT_DELAY_MS override if provided', () => {
      process.env.TOKEN_LOGOUT_DELAY_MS = '3000';
      const userId = 'user1';
      service.scheduleTokenExpiryWarning(userId, 60000);

      // Fire TOKEN_EXPIRING
      jest.advanceTimersByTime(30000);
      expect(authGateway.emitTokenExpiring).toHaveBeenCalled();

      // Should not fire before 3s
      jest.advanceTimersByTime(2999);
      expect(authGateway.emitForceLogout).not.toHaveBeenCalled();

      // Should fire at 3s
      jest.advanceTimersByTime(1);
      expect(authGateway.emitForceLogout).toHaveBeenCalledWith(userId);
    });

    it('cancelForceLogout should prevent FORCE_LOGOUT from firing', () => {
      const userId = 'user1';
      service.scheduleTokenExpiryWarning(userId, 60000);

      // Fire TOKEN_EXPIRING
      jest.advanceTimersByTime(30000);
      expect(authGateway.emitTokenExpiring).toHaveBeenCalled();

      // Cancel before FORCE_LOGOUT fires
      service.cancelForceLogout(userId);

      // Advance past the force-logout delay
      jest.advanceTimersByTime(10 * 60 * 1000);
      expect(authGateway.emitForceLogout).not.toHaveBeenCalled();
    });

    it('cancelForceLogout should be safe to call when no timeout exists', () => {
      expect(() => service.cancelForceLogout('nonexistent')).not.toThrow();
    });

    it('scheduling a new warning should cancel any existing force-logout', () => {
      const userId = 'user1';
      service.scheduleTokenExpiryWarning(userId, 60000);

      // Fire TOKEN_EXPIRING to start force-logout timer
      jest.advanceTimersByTime(30000);
      expect(authGateway.emitTokenExpiring).toHaveBeenCalledTimes(1);

      // Schedule a new warning (simulating token refresh)
      service.scheduleTokenExpiryWarning(userId, 60000);

      // Old force-logout should not fire
      jest.advanceTimersByTime(10 * 60 * 1000);
      expect(authGateway.emitForceLogout).not.toHaveBeenCalled();
    });
  });
});
