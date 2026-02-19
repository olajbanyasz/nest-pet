import { Test, TestingModule } from '@nestjs/testing';

import { AuthGateway } from './auth.gateway';
import { TokenExpiryService } from './token-expiry.service';

describe('TokenExpiryService', () => {
  let service: TokenExpiryService;
  let authGateway: { emitTokenExpiring: jest.Mock };

  beforeEach(async () => {
    authGateway = {
      emitTokenExpiring: jest.fn(),
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

      delete process.env.TOKEN_WARNING_DELAY_MS;
    });

    it('should skip scheduling if warningDelay <= 0', () => {
      const userId = 'user1';
      service.scheduleTokenExpiryWarning(userId, 10000); // 10s -> delay = -20s

      expect(jest.getTimerCount()).toBe(0);
    });
  });
});
