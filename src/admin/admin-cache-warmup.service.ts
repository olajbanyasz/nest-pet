import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';

import { AdminService } from './admin.service';

@Injectable()
export class AdminCacheWarmupService implements OnModuleInit {
  private readonly logger = new Logger(AdminCacheWarmupService.name);
  private usersWarmupRunning = false;
  private detailsWarmupRunning = false;

  constructor(private readonly adminService: AdminService) {}

  async onModuleInit(): Promise<void> {
    await this.warmUpAll('startup');
  }

  @Cron(CronExpression.EVERY_MINUTE)
  async warmUpUsers(): Promise<void> {
    if (this.usersWarmupRunning) {
      return;
    }
    this.usersWarmupRunning = true;
    try {
      await this.adminService.getUsers(undefined, false);
      await this.adminService.getUsers(undefined, true);
    } catch (error: unknown) {
      this.logger.warn(
        `Users cache warmup failed: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
    } finally {
      this.usersWarmupRunning = false;
    }
  }

  @Cron(CronExpression.EVERY_HOUR)
  async warmUpDetails(): Promise<void> {
    if (this.detailsWarmupRunning) {
      return;
    }
    this.detailsWarmupRunning = true;
    try {
      await this.adminService.getApplicationDetails();
    } catch (error: unknown) {
      this.logger.warn(
        `Details cache warmup failed: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
    } finally {
      this.detailsWarmupRunning = false;
    }
  }

  private async warmUpAll(trigger: 'startup'): Promise<void> {
    this.logger.log(`Admin cache warmup started (${trigger})`);
    await Promise.all([this.warmUpUsers(), this.warmUpDetails()]);
    this.logger.log(`Admin cache warmup finished (${trigger})`);
  }
}
