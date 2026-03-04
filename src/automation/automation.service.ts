import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { isValidObjectId, Model, Types } from 'mongoose';

import { AppEventBusService } from '../events/app-event-bus.service';
import {
  APP_EVENT_TODO_COMPLETED,
  TodoCompletedEvent,
} from '../events/events.types';
import {
  UserAutomationStats,
  UserAutomationStatsDocument,
} from './schemas/user-automation-stats.schema';

@Injectable()
export class AutomationService {
  private readonly logger = new Logger(AutomationService.name);
  private unsubscribeTodoCompleted?: () => void;

  constructor(
    @InjectModel(UserAutomationStats.name)
    private readonly userAutomationStatsModel: Model<UserAutomationStatsDocument>,
    private readonly eventBus: AppEventBusService,
  ) {
    this.unsubscribeTodoCompleted = this.eventBus.subscribe<TodoCompletedEvent>(
      APP_EVENT_TODO_COMPLETED,
      (event) => this.handleTodoCompleted(event),
    );
  }

  onModuleDestroy(): void {
    this.unsubscribeTodoCompleted?.();
  }

  async getUserTodoCompletionStats(userId: string): Promise<{
    userId: string;
    completedTodoEvents: number;
    lastCompletedTodoAt: Date | null;
    currentStreakDays: number;
    bestStreakDays: number;
  }> {
    if (!isValidObjectId(userId)) {
      throw new BadRequestException('Invalid userId format');
    }

    const stats = await this.userAutomationStatsModel.findOne({
      userId: new Types.ObjectId(userId),
    });

    if (!stats) {
      return {
        userId,
        completedTodoEvents: 0,
        lastCompletedTodoAt: null,
        currentStreakDays: 0,
        bestStreakDays: 0,
      };
    }

    return {
      userId,
      completedTodoEvents: stats.completedTodoEvents,
      lastCompletedTodoAt: stats.lastCompletedTodoAt,
      currentStreakDays: stats.currentStreakDays ?? 0,
      bestStreakDays: stats.bestStreakDays ?? 0,
    };
  }

  private async handleTodoCompleted(event: TodoCompletedEvent): Promise<void> {
    const completedAt = new Date(event.completedAt);
    const eventDay = this.toUtcDayKey(completedAt);
    const userId = new Types.ObjectId(event.userId);

    const existing = await this.userAutomationStatsModel.findOne({ userId });

    const previousCurrentStreak = (existing?.currentStreakDays as number) ?? 0;
    const previousBestStreak = (existing?.bestStreakDays as number) ?? 0;
    const previousDay = (existing?.lastCompletionDay as string | null) ?? null;

    let nextCurrentStreak = previousCurrentStreak;
    let nextBestStreak = previousBestStreak;
    let nextLastCompletionDay = previousDay;

    if (!previousDay) {
      nextCurrentStreak = 1;
      nextLastCompletionDay = eventDay;
    } else if (eventDay === previousDay) {
      nextCurrentStreak = previousCurrentStreak;
    } else if (this.isNextUtcDay(previousDay, eventDay)) {
      nextCurrentStreak = Math.max(previousCurrentStreak, 1) + 1;
      nextLastCompletionDay = eventDay;
    } else if (eventDay > previousDay) {
      nextCurrentStreak = 1;
      nextLastCompletionDay = eventDay;
    } else {
      nextCurrentStreak = previousCurrentStreak;
    }

    nextBestStreak = Math.max(previousBestStreak, nextCurrentStreak);

    const previousLastCompletedAt = existing?.lastCompletedTodoAt ?? null;
    const nextLastCompletedAt =
      !previousLastCompletedAt || completedAt > previousLastCompletedAt
        ? completedAt
        : previousLastCompletedAt;

    await this.userAutomationStatsModel.updateOne(
      { userId },
      {
        $inc: { completedTodoEvents: 1 },
        $set: {
          lastCompletedTodoAt: nextLastCompletedAt,
          currentStreakDays: nextCurrentStreak,
          bestStreakDays: nextBestStreak,
          lastCompletionDay: nextLastCompletionDay,
        },
      },
      { upsert: true },
    );

    this.logger.log(
      `Automation processed todo.completed user=${event.userId}, todo=${event.todoId}`,
    );
  }

  private toUtcDayKey(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  private isNextUtcDay(previousDay: string, nextDay: string): boolean {
    const previousDate = new Date(`${previousDay}T00:00:00.000Z`);
    const expectedNextDate = new Date(previousDate);
    expectedNextDate.setUTCDate(expectedNextDate.getUTCDate() + 1);

    return this.toUtcDayKey(expectedNextDate) === nextDay;
  }
}
