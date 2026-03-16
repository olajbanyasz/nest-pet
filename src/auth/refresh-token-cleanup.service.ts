import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Model } from 'mongoose';

import {
  RefreshToken,
  RefreshTokenDocument,
} from './schemas/refresh-token.schema';

@Injectable()
export class RefreshTokenCleanupService {
  private readonly logger = new Logger(RefreshTokenCleanupService.name);

  constructor(
    @InjectModel(RefreshToken.name)
    private readonly refreshTokenModel: Model<RefreshTokenDocument>,
  ) {}

  @Cron(CronExpression.EVERY_HOUR)
  async removeExpiredRefreshTokens(): Promise<void> {
    const now = new Date();
    const result = await this.refreshTokenModel.deleteMany({
      expiresAt: { $lte: now },
    });
    const deletedCount = result.deletedCount ?? 0;

    if (deletedCount > 0) {
      this.logger.log(`Removed ${deletedCount} expired refresh tokens`);
    }
  }
}
