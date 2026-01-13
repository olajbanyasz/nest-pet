import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { TodosService } from './todos.service';
import { CreateTodoDto } from './dto/create-todo.dto';
import { Todo } from './schemas/todo.schema';
import { NotFoundException, BadRequestException } from '@nestjs/common';

describe('TodosService', () => {
  interface MockTodo {
    id: string;
    title: string;
    completed: boolean;
    deleted: boolean;
    userId: string;
  }

  let service: TodosService;

  const USER_ID = 'u1';

  const ID1 = '507f1f77bcf86cd799439011';
  const ID2 = '507f1f77bcf86cd799439012';
  const ID3 = '507f1f77bcf86cd799439013';

  const sampleTodos: MockTodo[] = [
    { id: ID1, title: 'A', completed: false, deleted: false, userId: USER_ID },
    { id: ID2, title: 'B', completed: true, deleted: false, userId: USER_ID },
    { id: ID3, title: 'C', completed: false, deleted: true, userId: USER_ID },
  ];

  const saveMock = jest.fn();

  const mockModel = {
    find: jest.fn(),
    findOne: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    findOneAndUpdate: jest.fn(),
  };

  const mockModelConstructor = jest.fn().mockImplementation(() => ({
    save: saveMock,
  }));

  // a mongoose Model egyszerre constructor + static metódusok
  const mockTodoModel = Object.assign(mockModelConstructor, mockModel);

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TodosService,
        {
          provide: getModelToken(Todo.name),
          useValue: mockTodoModel,
        },
      ],
    }).compile();

    service = module.get<TodosService>(TodosService);
  });

  describe('findAll', () => {
    it('returns non-deleted todos for user', async () => {
      mockModel.find.mockReturnValue({
        exec: jest
          .fn()
          .mockResolvedValue(sampleTodos.filter((t) => !t.deleted)),
      });

      const res = await service.findAll(USER_ID);
      const todos = res as unknown as MockTodo[];

      expect(mockModel.find).toHaveBeenCalledWith({
        userId: USER_ID,
        deleted: false,
      });

      expect(todos).toHaveLength(2);
      expect(todos.find((t) => t.id === ID3)).toBeUndefined();
    });

    it('filters by completed=true', async () => {
      mockModel.find.mockReturnValue({
        exec: jest
          .fn()
          .mockResolvedValue(sampleTodos.filter((t) => t.completed)),
      });

      const res = await service.findAll(USER_ID, true);
      const todos = res as unknown as MockTodo[];

      expect(mockModel.find).toHaveBeenCalledWith({
        userId: USER_ID,
        deleted: false,
        completed: true,
      });

      expect(todos).toHaveLength(1);
      expect(todos[0].id).toBe(ID2);
    });

    it('filters by completed=false', async () => {
      mockModel.find.mockReturnValue({
        exec: jest
          .fn()
          .mockResolvedValue(sampleTodos.filter((t) => !t.completed)),
      });

      const res = await service.findAll(USER_ID, false);
      const todos = res as unknown as MockTodo[];

      expect(todos.every((t) => t.completed === false)).toBe(true);
    });
  });

  describe('findOne', () => {
    it('returns todo when found', async () => {
      mockModel.findOne.mockResolvedValue(sampleTodos[0]);

      const res = await service.findOne(ID1, USER_ID);
      const todo = res as unknown as MockTodo;

      expect(mockModel.findOne).toHaveBeenCalledWith({
        _id: ID1,
        userId: USER_ID,
      });

      expect(todo.id).toBe(ID1);
    });

    it('throws NotFoundException when not found', async () => {
      mockModel.findOne.mockResolvedValue(null);

      await expect(service.findOne(ID1, USER_ID)).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });

    it('throws BadRequestException for invalid id', async () => {
      await expect(service.findOne('bad-id', USER_ID)).rejects.toBeInstanceOf(
        BadRequestException,
      );
    });
  });

  describe('create', () => {
    it('creates and returns new todo', async () => {
      const dto: CreateTodoDto = { title: 'New', completed: false };

      saveMock.mockResolvedValue({
        id: 'new',
        ...dto,
        userId: USER_ID,
      });

      const res = await service.create(dto, USER_ID);
      const todo = res as unknown as MockTodo;

      expect(saveMock).toHaveBeenCalled();
      expect(todo.id).toBe('new');
      expect(todo.title).toBe('New');
    });
  });

  describe('update', () => {
    it('updates and returns todo', async () => {
      mockModel.findByIdAndUpdate.mockReturnValue({
        exec: jest.fn().mockResolvedValue({
          ...sampleTodos[0],
          completed: true,
        }),
      });

      const res = await service.update(ID1, USER_ID, { completed: true });
      const todo = res as unknown as MockTodo;

      expect(todo.completed).toBe(true);
    });

    it('throws NotFoundException when missing', async () => {
      mockModel.findByIdAndUpdate.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(
        service.update(ID1, USER_ID, { completed: true }),
      ).rejects.toBeInstanceOf(NotFoundException);
    });
  });

  describe('delete', () => {
    it('soft deletes todo', async () => {
      mockModel.findOneAndUpdate.mockReturnValue({
        exec: jest.fn().mockResolvedValue({
          ...sampleTodos[0],
          deleted: true,
        }),
      });

      const res = await service.delete(ID1, USER_ID);
      const todo = res as unknown as MockTodo;

      expect(todo.deleted).toBe(true);
    });

    it('throws NotFoundException when missing', async () => {
      mockModel.findOneAndUpdate.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(service.delete(ID1, USER_ID)).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });

    it('throws BadRequestException for invalid id', async () => {
      await expect(service.delete('bad-id', USER_ID)).rejects.toBeInstanceOf(
        BadRequestException,
      );
    });
  });
});
