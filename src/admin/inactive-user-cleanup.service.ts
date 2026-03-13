import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Model } from 'mongoose';

import { User, UserDocument, UserRole } from '../users/schemas/user.schema';

@Injectable()
export class InactiveUserCleanupService {
  private readonly logger = new Logger(InactiveUserCleanupService.name);
  private readonly inactiveDays = Number.parseInt(
    process.env.INACTIVE_USER_DAYS ?? '90',
    10,
  );

  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_3AM)
  async markInactiveUsers(): Promise<void> {
    const cutoff = new Date(
      Date.now() - this.inactiveDays * 24 * 60 * 60 * 1000,
    );

    const result = await this.userModel.updateMany(
      {
        role: UserRole.USER,
        deleted: { $ne: true },
        inactive: { $ne: true },
        $or: [
          { lastLoginAt: { $lte: cutoff } },
          { lastLoginAt: { $exists: false }, createdAt: { $lte: cutoff } },
        ],
      },
      {
        $set: {
          inactive: true,
          inactiveAt: new Date(),
          inactiveReason: `Auto-inactive after ${this.inactiveDays} days`,
        },
        $unset: {
          reactivatedAt: 1,
        },
      },
    );

    const modified = result.modifiedCount ?? 0;
    if (modified > 0) {
      this.logger.log(`Marked ${modified} users as inactive`);
    }
  }
}
