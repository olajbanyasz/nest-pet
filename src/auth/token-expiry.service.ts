import { Injectable, Logger } from '@nestjs/common';

import { AuthGateway } from './auth.gateway';

const DEFAULT_LOGOUT_DELAY_MS = 10 * 60 * 1000; // 10 minutes

@Injectable()
export class TokenExpiryService {
  private readonly logger = new Logger(TokenExpiryService.name);
  private readonly timeouts = new Map<string, NodeJS.Timeout>();
  private readonly forceLogoutTimeouts = new Map<string, NodeJS.Timeout>();

  constructor(private readonly authGateway: AuthGateway) {}

  scheduleTokenExpiryWarning(userId: string, tokenExpiresInMs: number): void {
    const overrideDelayMs = Number(process.env.TOKEN_WARNING_DELAY_MS);
    const warningDelay = Number.isFinite(overrideDelayMs)
      ? overrideDelayMs
      : tokenExpiresInMs - 30_000;

    const existingTimeout = this.timeouts.get(userId);
    if (existingTimeout) {
      clearTimeout(existingTimeout);
      this.timeouts.delete(userId);
    }

    this.cancelForceLogout(userId);

    if (warningDelay <= 0) {
      this.logger.warn('Token expiry warning skipped (too short)');
      return;
    }

    this.logger.log(
      `Scheduling token expiry warning for user=${userId} in ${warningDelay}ms`,
    );

    const timeout = setTimeout(() => {
      this.timeouts.delete(userId);
      this.logger.log(`Emitting TOKEN_EXPIRING for user=${userId}`);
      this.authGateway.emitTokenExpiring(userId);
      this.scheduleForceLogout(userId);
    }, warningDelay);

    this.timeouts.set(userId, timeout);
  }

  cancelForceLogout(userId: string): void {
    const existing = this.forceLogoutTimeouts.get(userId);
    if (existing) {
      clearTimeout(existing);
      this.forceLogoutTimeouts.delete(userId);
      this.logger.log(`Cancelled force-logout timer for user=${userId}`);
    }
  }

  private scheduleForceLogout(userId: string): void {
    const overrideMs = Number(process.env.TOKEN_LOGOUT_DELAY_MS);
    const logoutDelay = Number.isFinite(overrideMs)
      ? overrideMs
      : DEFAULT_LOGOUT_DELAY_MS;

    this.logger.log(
      `Scheduling FORCE_LOGOUT for user=${userId} in ${logoutDelay}ms`,
    );

    const timeout = setTimeout(() => {
      this.forceLogoutTimeouts.delete(userId);
      this.logger.log(`Emitting FORCE_LOGOUT for user=${userId}`);
      this.authGateway.emitForceLogout(userId);
    }, logoutDelay);

    this.forceLogoutTimeouts.set(userId, timeout);
  }
}
