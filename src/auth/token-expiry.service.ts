import { Injectable, Logger } from '@nestjs/common';
import { AuthGateway } from './auth.gateway';

@Injectable()
export class TokenExpiryService {
  private readonly logger = new Logger(TokenExpiryService.name);
  private readonly timeouts = new Map<string, NodeJS.Timeout>();

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
    }, warningDelay);

    this.timeouts.set(userId, timeout);
  }
}
