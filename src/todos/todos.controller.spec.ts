import { GUARDS_METADATA } from '@nestjs/common/constants';
import { Test } from '@nestjs/testing';
import { Types } from 'mongoose';

import { AuthenticatedUser } from '../auth/jwt.strategy';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ROLES_KEY } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { UserRole } from '../users/schemas/user.schema';
import { CreateTodoDto } from './dto/create-todo.dto';
import { TodosController } from './todos.controller';
import { TodosService } from './todos.service';

describe('TodosController', () => {
  let controller: TodosController;
  let mockService: Partial<Record<keyof TodosService, jest.Mock>>;

  interface MockTodo {
    _id?: string;
    title: string;
    completed: boolean;
    deleted: boolean;
    userId: Types.ObjectId;
  }

  const mockUser: AuthenticatedUser = {
    userId: new Types.ObjectId().toHexString(),
    email: 'test@user.com',
    role: UserRole.USER,
    name: 'Test User',
  };

  const sampleTodos: MockTodo[] = [
    {
      _id: '1',
      title: 'A',
      completed: false,
      deleted: false,
      userId: new Types.ObjectId(mockUser.userId),
    },
    {
      _id: '2',
      title: 'B',
      completed: true,
      deleted: false,
      userId: new Types.ObjectId(mockUser.userId),
    },
    {
      _id: '3',
      title: 'C',
      completed: false,
      deleted: true,
      userId: new Types.ObjectId(mockUser.userId),
    },
  ];

  const statsResponse = {
    createdTodos: { '2026-01-01': 1, '2026-01-02': 2 },
    completedTodos: { '2026-01-01': 0, '2026-01-02': 1 },
    deletedTodos: { '2026-01-01': 0, '2026-01-02': 0 },
  };

  beforeEach(async () => {
    mockService = {
      findAll: jest
        .fn()
        .mockImplementation(
          (userId: string, completed?: boolean): Promise<MockTodo[]> => {
            let list = sampleTodos.filter(
              (t) => !t.deleted && t.userId.equals(userId),
            );
            if (completed === true) list = list.filter((t) => t.completed);
            if (completed === false) list = list.filter((t) => !t.completed);
            return Promise.resolve(list);
          },
        ),
      findOne: jest
        .fn()
        .mockImplementation(
          (id: string, userId: string): Promise<MockTodo | null> => {
            const found =
              sampleTodos.find(
                (t) => t._id === id && t.userId.equals(userId),
              ) || null;
            return Promise.resolve(found);
          },
        ),
      create: jest
        .fn()
        .mockImplementation(
          (dto: CreateTodoDto, userId: string): Promise<MockTodo> => {
            const created: MockTodo = {
              _id: 'new',
              ...dto,
              userId: new Types.ObjectId(userId),
              deleted: false,
            };
            return Promise.resolve(created);
          },
        ),
      update: jest
        .fn()
        .mockImplementation(
          (
            id: string,
            userId: string,
            dto: Partial<CreateTodoDto>,
          ): Promise<MockTodo | null> => {
            const idx = sampleTodos.findIndex(
              (t) => t._id === id && t.userId.equals(userId),
            );
            if (idx === -1) return Promise.resolve(null);
            const updated: MockTodo = { ...sampleTodos[idx], ...dto };
            return Promise.resolve(updated);
          },
        ),
      delete: jest
        .fn()
        .mockImplementation(
          (id: string, userId: string): Promise<MockTodo | null> => {
            const idx = sampleTodos.findIndex(
              (t) => t._id === id && t.userId.equals(userId),
            );
            if (idx === -1) return Promise.resolve(null);
            const deleted: MockTodo = { ...sampleTodos[idx], deleted: true };
            return Promise.resolve(deleted);
          },
        ),
      getLast14DaysStats: jest.fn().mockResolvedValue(statsResponse),
    };

    const module = await Test.createTestingModule({
      controllers: [TodosController],
      providers: [{ provide: TodosService, useValue: mockService }],
    }).compile();

    controller = module.get<TodosController>(TodosController);
  });

  describe('findAll', () => {
    it('returns all non-deleted todos for user when no query', async () => {
      const res: MockTodo[] = await controller.findAll(mockUser, undefined);
      expect(mockService.findAll).toHaveBeenCalledWith(
        mockUser.userId,
        undefined,
      );
      expect(res).toHaveLength(2);
      expect(res.find((r) => r._id === '3')).toBeUndefined();
    });

    it('filters by completed=true', async () => {
      const res: MockTodo[] = await controller.findAll(mockUser, 'true');
      expect(mockService.findAll).toHaveBeenCalledWith(mockUser.userId, true);
      expect(res).toHaveLength(1);
      expect(res[0]._id).toBe('2');
    });

    it('filters by completed=false', async () => {
      const res: MockTodo[] = await controller.findAll(mockUser, 'false');
      expect(mockService.findAll).toHaveBeenCalledWith(mockUser.userId, false);
      expect(res.every((t) => t.completed === false)).toBeTruthy();
    });
  });

  describe('findOne', () => {
    it('returns a todo when found', async () => {
      const res: MockTodo | null = await controller.findOne(mockUser, '1');
      expect(mockService.findOne).toHaveBeenCalledWith('1', mockUser.userId);
      expect(res).not.toBeNull();
      expect(res._id).toBe('1');
    });

    it('returns null when not found', async () => {
      (mockService.findOne as jest.Mock).mockResolvedValueOnce(null);
      const res = await controller.findOne(mockUser, 'missing');
      expect(mockService.findOne).toHaveBeenCalledWith(
        'missing',
        mockUser.userId,
      );
      expect(res).toBeNull();
    });
  });

  describe('create', () => {
    it('creates and returns new todo', async () => {
      const dto: CreateTodoDto = { title: 'New', completed: false };
      const res: MockTodo = await controller.create(mockUser, dto);
      expect(mockService.create).toHaveBeenCalledWith(dto, mockUser.userId);
      expect(res._id).toBe('new');
      expect(res.title).toBe('New');
    });
  });

  describe('update', () => {
    it('updates existing todo', async () => {
      const res: MockTodo | null = await controller.update(mockUser, '1', {
        completed: true,
      });
      expect(mockService.update).toHaveBeenCalledWith('1', mockUser.userId, {
        completed: true,
      });
      expect(res.completed).toBe(true);
    });
  });

  describe('delete', () => {
    it('soft deletes a todo', async () => {
      const res: MockTodo | null = await controller.delete(mockUser, '1');
      expect(mockService.delete).toHaveBeenCalledWith('1', mockUser.userId);
      expect(res._id).toBe('1');
      expect(res.deleted).toBe(true);
    });
  });

  describe('getLast14DaysStats', () => {
    it('returns stats from service', async () => {
      const res = await controller.getLast14DaysStats();

      expect(mockService.getLast14DaysStats).toHaveBeenCalledTimes(1);
      expect(res).toEqual(statsResponse);
    });
  });

  describe('getLast14DaysStats metadata', () => {
    const methodName = 'getLast14DaysStats' as const;
    const handler = Object.getOwnPropertyDescriptor(
      TodosController.prototype,
      methodName,
    )?.value as unknown;

    it('requires admin role', () => {
      expect(typeof handler).toBe('function');

      const roles = Reflect.getMetadata(
        ROLES_KEY,
        handler as object,
      ) as UserRole[];

      expect(roles).toEqual([UserRole.ADMIN]);
    });

    it('uses JwtAuthGuard and RolesGuard', () => {
      expect(typeof handler).toBe('function');

      const guards = Reflect.getMetadata(
        GUARDS_METADATA,
        handler as object,
      ) as unknown[];

      expect(guards).toEqual([JwtAuthGuard, RolesGuard]);
    });
  });
});
