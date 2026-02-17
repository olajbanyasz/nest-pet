import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { TodosService } from './todos.service';
import { Todo } from './schemas/todo.schema';
import { CreateTodoDto } from './dto/create-todo.dto';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Types } from 'mongoose';

describe('TodosService', () => {
  let service: TodosService;

  const USER_ID = new Types.ObjectId();

  const TODO_ID_1 = new Types.ObjectId();
  const TODO_ID_2 = new Types.ObjectId();
  const TODO_ID_3 = new Types.ObjectId();

  const todos = [
    {
      _id: TODO_ID_1,
      title: 'Todo 1',
      completed: false,
      deleted: false,
      userId: USER_ID,
    },
    {
      _id: TODO_ID_2,
      title: 'Todo 2',
      completed: true,
      deleted: false,
      userId: USER_ID,
    },
    {
      _id: TODO_ID_3,
      title: 'Todo 3',
      completed: false,
      deleted: true,
      userId: USER_ID,
    },
  ];

  const saveMock = jest.fn<Promise<Todo>, [any]>();

  const mockModel = {
    find: jest.fn(),
    findOne: jest.fn(),
    findOneAndUpdate: jest.fn(),
    updateMany: jest.fn(),
    countDocuments: jest.fn(),
    aggregate: jest.fn(),
  };

  const mockModelConstructor = jest.fn().mockImplementation(
    (data: any) =>
      ({
        ...data,
        save: saveMock,
      }) as unknown as Todo,
  );

  const todoModelMock = Object.assign(mockModelConstructor, mockModel);

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TodosService,
        {
          provide: getModelToken(Todo.name),
          useValue: todoModelMock,
        },
      ],
    }).compile();

    service = module.get<TodosService>(TodosService);
  });

  describe('findAll', () => {
    it('returns non-deleted todos', async () => {
      mockModel.find.mockReturnValue({
        exec: jest
          .fn()
          .mockResolvedValue(todos.filter((t) => !t.deleted) as Todo[]),
      });

      const result = await service.findAll(USER_ID.toHexString());

      expect(mockModel.find).toHaveBeenCalledWith({
        userId: USER_ID,
        deleted: false,
      });
      expect(result).toHaveLength(2);
    });

    it('filters completed=true', async () => {
      mockModel.find.mockReturnValue({
        exec: jest
          .fn()
          .mockResolvedValue(todos.filter((t) => t.completed) as Todo[]),
      });

      const result = await service.findAll(USER_ID.toHexString(), true);

      expect(mockModel.find).toHaveBeenCalledWith({
        userId: USER_ID,
        deleted: false,
        completed: true,
      });
      expect(result).toHaveLength(1);
    });

    it('throws BadRequest for invalid userId', async () => {
      await expect(service.findAll('bad-id')).rejects.toBeInstanceOf(
        BadRequestException,
      );
    });
  });

  describe('findOne', () => {
    it('returns todo when found', async () => {
      mockModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(todos[0] as Todo),
      });

      const result = await service.findOne(
        TODO_ID_1.toHexString(),
        USER_ID.toHexString(),
      );

      expect(mockModel.findOne).toHaveBeenCalledWith({
        _id: TODO_ID_1,
        userId: USER_ID,
      });
      expect(result.title).toBe('Todo 1');
    });

    it('throws NotFoundException when missing', async () => {
      mockModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(
        service.findOne(TODO_ID_1.toHexString(), USER_ID.toHexString()),
      ).rejects.toBeInstanceOf(NotFoundException);
    });

    it('throws BadRequest for invalid ids', async () => {
      await expect(
        service.findOne('bad-id', USER_ID.toHexString()),
      ).rejects.toBeInstanceOf(BadRequestException);
    });
  });

  describe('create', () => {
    it('creates and returns todo', async () => {
      const dto: CreateTodoDto = { title: 'New todo', completed: false };

      const savedTodo = {
        _id: new Types.ObjectId(),
        ...dto,
        deleted: false,
        userId: USER_ID,
      };

      saveMock.mockResolvedValue(savedTodo as Todo);

      const result = await service.create(dto, USER_ID.toHexString());

      expect(saveMock).toHaveBeenCalled();
      expect(result.title).toBe('New todo');
      expect(result.userId.equals(USER_ID)).toBe(true);
    });

    it('throws BadRequest for invalid userId', async () => {
      await expect(
        service.create({ title: 'X', completed: false }, 'bad-id'),
      ).rejects.toBeInstanceOf(BadRequestException);
    });
  });

  describe('update', () => {
    it('updates and returns todo', async () => {
      mockModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(todos[0] as Todo),
      });

      mockModel.findOneAndUpdate.mockReturnValue({
        exec: jest.fn().mockResolvedValue({
          ...todos[0],
          completed: true,
          completedAt: new Date(),
        }),
      });

      const result = await service.update(
        TODO_ID_1.toHexString(),
        USER_ID.toHexString(),
        { completed: true },
      );

      expect(mockModel.findOne).toHaveBeenCalled();
      expect(mockModel.findOneAndUpdate).toHaveBeenCalled();
      expect(result.completed).toBe(true);
    });

    it('throws NotFoundException when missing', async () => {
      mockModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(
        service.update(TODO_ID_1.toHexString(), USER_ID.toHexString(), {
          completed: true,
        }),
      ).rejects.toBeInstanceOf(NotFoundException);
    });
  });

  describe('delete', () => {
    it('soft deletes todo', async () => {
      mockModel.findOneAndUpdate.mockReturnValue({
        exec: jest.fn().mockResolvedValue({
          ...todos[0],
          deleted: true,
        }),
      });

      const result = await service.delete(
        TODO_ID_1.toHexString(),
        USER_ID.toHexString(),
      );

      expect(result.deleted).toBe(true);
    });
  });

  describe('deleteTodosByUser', () => {
    it('soft deletes all todos of user', async () => {
      mockModel.updateMany.mockReturnValue({
        exec: jest.fn().mockResolvedValue({ modifiedCount: 2 }),
      });

      const result = await service.deleteTodosByUser(USER_ID.toHexString());

      expect(result.deletedCount).toBe(2);
    });

    it('throws BadRequest for invalid userId', async () => {
      await expect(service.deleteTodosByUser('bad-id')).rejects.toBeInstanceOf(
        BadRequestException,
      );
    });
  });

  describe('countTodosByUser', () => {
    it('counts non-deleted todos', async () => {
      mockModel.countDocuments.mockReturnValue({
        exec: jest.fn().mockResolvedValue(2),
      });

      const result = await service.countTodosByUser(USER_ID);

      expect(result).toBe(2);
    });
  });

  describe('getLast14DaysStats', () => {
    beforeEach(() => {
      jest.useFakeTimers().setSystemTime(new Date('2026-02-13T12:00:00.000Z'));
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('returns 14-day buckets and applies aggregation counts', async () => {
      mockModel.aggregate.mockReturnValue({
        exec: jest
          .fn()
          .mockResolvedValueOnce([
            { _id: '2026-02-01', count: 3 },
            { _id: '2026-02-13', count: 1 },
          ] as any)
          .mockResolvedValueOnce([{ _id: '2026-02-05', count: 2 }] as any)
          .mockResolvedValueOnce([{ _id: '2026-02-07', count: 4 }] as any),
      });

      const result = await service.getLast14DaysStats();

      expect(mockModel.aggregate).toHaveBeenCalledTimes(3);
      expect(Object.keys(result.createdTodos)).toHaveLength(14);
      expect(Object.keys(result.completedTodos)).toHaveLength(14);
      expect(Object.keys(result.deletedTodos)).toHaveLength(14);

      expect(result.createdTodos['2026-02-01']).toBe(3);
      expect(result.createdTodos['2026-02-13']).toBe(1);
      expect(result.createdTodos['2026-02-02']).toBe(0);

      expect(result.completedTodos['2026-02-05']).toBe(2);
      expect(result.completedTodos['2026-02-04']).toBe(0);

      expect(result.deletedTodos['2026-02-07']).toBe(4);
      expect(result.deletedTodos['2026-02-06']).toBe(0);
    });
  });
});
