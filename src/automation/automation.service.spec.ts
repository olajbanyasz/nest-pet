import { BadRequestException } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { Types } from 'mongoose';

import { AppEventBusService } from '../events/app-event-bus.service';
import { APP_EVENT_TODO_COMPLETED } from '../events/events.types';
import { AutomationService } from './automation.service';
import { UserAutomationStats } from './schemas/user-automation-stats.schema';

describe('AutomationService', () => {
  let service: AutomationService;

  const findOneMock = jest.fn();
  const updateOneMock = jest.fn();
  const subscribeMock = jest.fn();
  const unsubscribeMock = jest.fn();

  const userAutomationStatsModelMock = {
    findOne: findOneMock,
    updateOne: updateOneMock,
  };

  const eventBusMock = {
    subscribe: subscribeMock,
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    subscribeMock.mockReturnValue(unsubscribeMock);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AutomationService,
        {
          provide: getModelToken(UserAutomationStats.name),
          useValue: userAutomationStatsModelMock,
        },
        {
          provide: AppEventBusService,
          useValue: eventBusMock,
        },
      ],
    }).compile();

    service = module.get<AutomationService>(AutomationService);
  });

  it('returns zeroed completion stats when no stored stats exist', async () => {
    const userId = new Types.ObjectId().toHexString();
    findOneMock.mockResolvedValue(null);

    const result = await service.getUserTodoCompletionStats(userId);

    expect(result).toEqual({
      userId,
      completedTodoEvents: 0,
      lastCompletedTodoAt: null,
      currentStreakDays: 0,
      bestStreakDays: 0,
    });
  });

  it('throws BadRequestException for invalid user id', async () => {
    await expect(
      service.getUserTodoCompletionStats('invalid-id'),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('updates streak on consecutive-day completion event', async () => {
    const userId = new Types.ObjectId();
    const eventHandler = (subscribeMock.mock.calls[0] as unknown[])?.[1] as (
      payload: unknown,
    ) => Promise<void>;

    findOneMock.mockResolvedValue({
      userId,
      completedTodoEvents: 5,
      lastCompletedTodoAt: new Date('2026-03-01T09:30:00.000Z'),
      currentStreakDays: 2,
      bestStreakDays: 4,
      lastCompletionDay: '2026-03-01',
    });

    await eventHandler({
      userId: userId.toHexString(),
      todoId: new Types.ObjectId().toHexString(),
      completedAt: '2026-03-02T10:00:00.000Z',
    });

    expect(updateOneMock).toHaveBeenCalledWith(
      { userId },
      {
        $inc: { completedTodoEvents: 1 },
        $set: {
          lastCompletedTodoAt: new Date('2026-03-02T10:00:00.000Z'),
          currentStreakDays: 3,
          bestStreakDays: 4,
          lastCompletionDay: '2026-03-02',
        },
      },
      { upsert: true },
    );
  });

  it('does not increase streak for same-day completion event', async () => {
    const userId = new Types.ObjectId();
    const eventHandler = (subscribeMock.mock.calls[0] as unknown[])?.[1] as (
      payload: unknown,
    ) => Promise<void>;

    findOneMock.mockResolvedValue({
      userId,
      completedTodoEvents: 7,
      lastCompletedTodoAt: new Date('2026-03-02T12:00:00.000Z'),
      currentStreakDays: 3,
      bestStreakDays: 5,
      lastCompletionDay: '2026-03-02',
    });

    await eventHandler({
      userId: userId.toHexString(),
      todoId: new Types.ObjectId().toHexString(),
      completedAt: '2026-03-02T18:15:00.000Z',
    });

    expect(updateOneMock).toHaveBeenCalledWith(
      { userId },
      {
        $inc: { completedTodoEvents: 1 },
        $set: {
          lastCompletedTodoAt: new Date('2026-03-02T18:15:00.000Z'),
          currentStreakDays: 3,
          bestStreakDays: 5,
          lastCompletionDay: '2026-03-02',
        },
      },
      { upsert: true },
    );
  });

  it('ignores older out-of-order completion day for streak state', async () => {
    const userId = new Types.ObjectId();
    const eventHandler = (subscribeMock.mock.calls[0] as unknown[])?.[1] as (
      payload: unknown,
    ) => Promise<void>;

    findOneMock.mockResolvedValue({
      userId,
      completedTodoEvents: 8,
      lastCompletedTodoAt: new Date('2026-03-05T20:00:00.000Z'),
      currentStreakDays: 1,
      bestStreakDays: 5,
      lastCompletionDay: '2026-03-05',
    });

    await eventHandler({
      userId: userId.toHexString(),
      todoId: new Types.ObjectId().toHexString(),
      completedAt: '2026-03-03T10:00:00.000Z',
    });

    expect(updateOneMock).toHaveBeenCalledWith(
      { userId },
      {
        $inc: { completedTodoEvents: 1 },
        $set: {
          lastCompletedTodoAt: new Date('2026-03-05T20:00:00.000Z'),
          currentStreakDays: 1,
          bestStreakDays: 5,
          lastCompletionDay: '2026-03-05',
        },
      },
      { upsert: true },
    );
  });

  it('unsubscribes from event bus on destroy', () => {
    service.onModuleDestroy();
    expect(unsubscribeMock).toHaveBeenCalledTimes(1);
  });

  it('subscribes to todo.completed events on startup', () => {
    expect(subscribeMock).toHaveBeenCalledWith(
      APP_EVENT_TODO_COMPLETED,
      expect.any(Function),
    );
  });
});
