/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Test, TestingModule } from '@nestjs/testing';
import { TodosController } from './todos.controller';
import { TodosService } from './todos.service';
import { CreateTodoDto } from './dto/create-todo.dto';
import { BadRequestException } from '@nestjs/common';

describe('TodosController', () => {
  let controller: TodosController;
  let mockService: Partial<Record<keyof TodosService, jest.Mock>>;

  const sampleTodos = [
    { id: '1', title: 'A', completed: false, deleted: false },
    { id: '2', title: 'B', completed: true, deleted: false },
    { id: '3', title: 'C', completed: false, deleted: true },
  ];

  beforeEach(async () => {
    mockService = {
      findAll: jest.fn().mockImplementation((completed?: boolean) => {
        let list = sampleTodos.filter((t) => !t.deleted);
        if (completed === true) list = list.filter((t) => t.completed);
        if (completed === false) list = list.filter((t) => !t.completed);
        return Promise.resolve(list);
      }),
      findOne: jest.fn().mockImplementation((id: string) => {
        const found = sampleTodos.find((t) => t.id === id) || null;
        return Promise.resolve(found);
      }),
      create: jest.fn().mockImplementation((dto: CreateTodoDto) => {
        const created = { id: 'new', ...dto };
        return Promise.resolve(created);
      }),
      update: jest
        .fn()
        .mockImplementation((id: string, dto: Partial<CreateTodoDto>) => {
          const idx = sampleTodos.findIndex((t) => t.id === id);
          if (idx === -1) return Promise.resolve(null);
          const updated = { ...sampleTodos[idx], ...dto };
          return Promise.resolve(updated);
        }),
      delete: jest.fn().mockImplementation((id: string) => {
        const idx = sampleTodos.findIndex((t) => t.id === id);
        if (idx === -1) return Promise.resolve(null);
        const deleted = { ...sampleTodos[idx], deleted: true };
        return Promise.resolve(deleted);
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [TodosController],
      providers: [
        {
          provide: TodosService,
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get<TodosController>(TodosController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('returns all non-deleted todos when no query provided', async () => {
      const res = await controller.findAll(undefined);
      expect(mockService.findAll).toHaveBeenCalledWith(undefined);
      expect(res).toHaveLength(2);
      expect(res.find((r: any) => r.id === '3')).toBeUndefined();
    });

    it('filters by completed=true', async () => {
      const res = await controller.findAll('true');
      expect(mockService.findAll).toHaveBeenCalledWith(true);
      expect(res).toHaveLength(1);
      expect((res[0] as any).id).toBe('2');
    });

    it('filters by completed=false', async () => {
      const res = await controller.findAll('false');
      expect(mockService.findAll).toHaveBeenCalledWith(false);
      expect(res.every((t: any) => t.completed === false)).toBeTruthy();
    });

    it('propagates errors from service', async () => {
      (mockService.findAll as jest.Mock).mockRejectedValueOnce(new Error('db'));
      await expect(controller.findAll(undefined)).rejects.toThrow('db');
    });
  });

  describe('findOne', () => {
    it('returns a todo when found', async () => {
      const res = await controller.findOne('1');
      expect(mockService.findOne).toHaveBeenCalledWith('1');
      expect(res).not.toBeNull();
      expect((res as any)!.id).toBe('1');
    });

    it('returns null when not found', async () => {
      (mockService.findOne as jest.Mock).mockResolvedValueOnce(null);
      const res = await controller.findOne('missing');
      expect(mockService.findOne).toHaveBeenCalledWith('missing');
      expect(res).toBeNull();
    });

    it('propagates errors from service', async () => {
      (mockService.findOne as jest.Mock).mockRejectedValueOnce(
        new Error('fail'),
      );
      await expect(controller.findOne('1')).rejects.toThrow('fail');
    });
  });

  describe('create', () => {
    it('creates and returns the new todo', async () => {
      const dto: CreateTodoDto = { title: 'New', completed: false };
      const res = await controller.create(dto);
      expect(mockService.create).toHaveBeenCalledWith(dto);
      expect((res as any).id).toBe('new');
      expect((res as any).title).toBe('New');
    });

    it('propagates validation/service errors', async () => {
      (mockService.create as jest.Mock).mockRejectedValueOnce(
        new BadRequestException('bad'),
      );
      const invalidDto: CreateTodoDto = {
        title: '',
        completed: false,
      };
      await expect(controller.create(invalidDto)).rejects.toBeInstanceOf(
        BadRequestException,
      );
    });
  });

  describe('update', () => {
    it('updates existing todo and returns it', async () => {
      const res = await controller.update('1', { completed: true });
      expect(mockService.update).toHaveBeenCalledWith('1', { completed: true });
      expect((res as any)!.completed).toBe(true);
    });

    it('returns null when updating non-existent todo', async () => {
      (mockService.update as jest.Mock).mockResolvedValueOnce(null);
      const res = await controller.update('nope', { completed: true });
      expect(res).toBeNull();
    });

    it('propagates service errors', async () => {
      (mockService.update as jest.Mock).mockRejectedValueOnce(
        new Error('boom'),
      );
      await expect(controller.update('1', { completed: true })).rejects.toThrow(
        'boom',
      );
    });
  });

  describe('delete', () => {
    it('soft-deletes a todo and returns it', async () => {
      const res = await controller.delete('1');
      expect(mockService.delete).toHaveBeenCalledWith('1');
      expect(res).not.toBeNull();
      expect((res as any)!.deleted).toBe(true);
    });

    it('returns null when deleting non-existent todo', async () => {
      (mockService.delete as jest.Mock).mockResolvedValueOnce(null);
      const res = await controller.delete('doesnotexist');
      expect(res).toBeNull();
    });

    it('propagates service errors', async () => {
      (mockService.delete as jest.Mock).mockRejectedValueOnce(new Error('err'));
      await expect(controller.delete('1')).rejects.toThrow('err');
    });
  });
});
