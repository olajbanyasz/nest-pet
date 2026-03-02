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
      };
    }

    return {
      userId,
      completedTodoEvents: stats.completedTodoEvents,
      lastCompletedTodoAt: stats.lastCompletedTodoAt,
    };
  }

  private async handleTodoCompleted(event: TodoCompletedEvent): Promise<void> {
    const completedAt = new Date(event.completedAt);

    await this.userAutomationStatsModel.updateOne(
      { userId: new Types.ObjectId(event.userId) },
      {
        $inc: { completedTodoEvents: 1 },
        $set: { lastCompletedTodoAt: completedAt },
      },
      { upsert: true },
    );

    this.logger.log(
      `Automation processed todo.completed user=${event.userId}, todo=${event.todoId}`,
    );
  }
}
