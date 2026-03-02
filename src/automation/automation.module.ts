import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { AutomationController } from './automation.controller';
import { AutomationService } from './automation.service';
import {
  UserAutomationStats,
  UserAutomationStatsSchema,
} from './schemas/user-automation-stats.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: UserAutomationStats.name, schema: UserAutomationStatsSchema },
    ]),
  ],
  controllers: [AutomationController],
  providers: [AutomationService],
})
export class AutomationModule {}
