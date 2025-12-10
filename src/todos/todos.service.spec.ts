/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { TodosService } from './todos.service';
import { CreateTodoDto } from './dto/create-todo.dto';
import { Todo } from './schemas/todo.schema';
import { NotFoundException, BadRequestException } from '@nestjs/common';

describe('TodosService', () => {
  let service: TodosService;
  let mockModel: jest.Mock;

  // Use ObjectId-like strings so isValidObjectId checks pass/fail predictably
  const ID1 = '507f1f77bcf86cd799439011';
  const ID2 = '507f1f77bcf86cd799439012';
  const ID3 = '507f1f77bcf86cd799439013';

  const sampleTodos = [
    { _id: ID1, title: 'A', completed: false, deleted: false },
    { _id: ID2, title: 'B', completed: true, deleted: false },
    { _id: ID3, title: 'C', completed: false, deleted: true },
  ];

  beforeEach(async () => {
    // jest.fn used as a constructor (new mockModel(dto))
    mockModel = jest.fn().mockImplementation(function (dto: any) {
      this.save = jest.fn().mockResolvedValue({ _id: 'new', ...dto });
    });

    const findMock = jest.fn((filter: any) => {
      let list = sampleTodos.filter((t) => !t.deleted);
      if (filter && filter.completed === true)
        list = list.filter((t) => t.completed);
      if (filter && filter.completed === false)
        list = list.filter((t) => !t.completed);
      return { exec: jest.fn().mockResolvedValue(list) };
    });

    const findByIdMock = jest.fn((id: string) => {
      const found = sampleTodos.find((t) => t._id === id) || null;
      return { exec: jest.fn().mockResolvedValue(found) };
    });

    const findByIdAndUpdateMock = jest.fn((id: string, update: any) => {
      const idx = sampleTodos.findIndex((t) => t._id === id);
      if (idx === -1) return { exec: jest.fn().mockResolvedValue(null) };
      const updated = { ...sampleTodos[idx], ...update };
      return { exec: jest.fn().mockResolvedValue(updated) };
    });

    // attach static methods to the mock "Model"
    (mockModel as any).find = findMock;
    (mockModel as any).findById = findByIdMock;
    (mockModel as any).findByIdAndUpdate = findByIdAndUpdateMock;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TodosService,
        {
          provide: getModelToken(Todo.name),
          useValue: mockModel,
        },
      ],
    }).compile();

    service = module.get<TodosService>(TodosService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('returns non-deleted todos when no filter provided', async () => {
      const res = await service.findAll(undefined);
      expect((mockModel as any).find).toHaveBeenCalledWith({ deleted: false });
      expect(res).toHaveLength(2);
      expect(res.find((r) => (r as any)._id === ID3)).toBeUndefined();
    });

    it('filters by completed=true', async () => {
      const res = await service.findAll(true);
      expect((mockModel as any).find).toHaveBeenCalledWith({
        deleted: false,
        completed: true,
      });
      expect(res).toHaveLength(1);
      expect((res[0] as any)._id).toBe(ID2);
    });

    it('filters by completed=false', async () => {
      const res = await service.findAll(false);
      expect((mockModel as any).find).toHaveBeenCalledWith({
        deleted: false,
        completed: false,
      });
      expect(res.every((t) => t.completed === false)).toBeTruthy();
    });

    it('propagates underlying errors', async () => {
      (mockModel as any).find.mockImplementationOnce(() => {
        return { exec: jest.fn().mockRejectedValue(new Error('db failure')) };
      });
      await expect(service.findAll()).rejects.toThrow('db failure');
    });
  });

  describe('findOne', () => {
    it('returns document when found', async () => {
      const res = await service.findOne(ID1);
      expect((mockModel as any).findById).toHaveBeenCalledWith(ID1);
      expect(res).not.toBeNull();
      expect((res as any)!._id).toBe(ID1);
    });

    it('throws NotFoundException when not found', async () => {
      (mockModel as any).findById.mockImplementationOnce(() => ({
        exec: jest.fn().mockResolvedValue(null),
      }));
      await expect(
        service.findOne('507f1f77bcf86cd799439099'),
      ).rejects.toBeInstanceOf(NotFoundException);
    });

    it('throws BadRequestException for invalid id format', async () => {
      await expect(service.findOne('bad-id')).rejects.toBeInstanceOf(
        BadRequestException,
      );
    });

    it('propagates errors from findById', async () => {
      (mockModel as any).findById.mockImplementationOnce(() => ({
        exec: jest.fn().mockRejectedValue(new Error('fail')),
      }));
      await expect(service.findOne(ID1)).rejects.toThrow('fail');
    });
  });

  describe('create', () => {
    it('creates and returns saved document', async () => {
      const dto: CreateTodoDto = { title: 'New', completed: false };
      const res = await service.create(dto);
      expect(mockModel).toHaveBeenCalledWith(dto);
      expect((res as any)._id).toBe('new');
      expect((res as any).title).toBe('New');
    });

    it('propagates save errors', async () => {
      (mockModel as any).mockImplementationOnce(function (dto: any) {
        this.save = jest.fn().mockRejectedValue(new Error('save fail'));
      });
      await expect(
        service.create({ title: 'x', completed: false }),
      ).rejects.toThrow('save fail');
    });
  });

  describe('update', () => {
    it('updates existing document and returns updated', async () => {
      const res = await service.update(ID1, { completed: true });
      expect((mockModel as any).findByIdAndUpdate).toHaveBeenCalledWith(
        ID1,
        { completed: true },
        { new: true },
      );
      expect((res as any)._id).toBe(ID1);
      expect((res as any).completed).toBe(true);
    });

    it('throws NotFoundException when updating non-existent id', async () => {
      (mockModel as any).findByIdAndUpdate.mockImplementationOnce(() => ({
        exec: jest.fn().mockResolvedValue(null),
      }));
      await expect(
        service.update('507f1f77bcf86cd799439099', { completed: true }),
      ).rejects.toBeInstanceOf(NotFoundException);
    });

    it('throws BadRequestException for invalid id format', async () => {
      await expect(
        service.update('bad-id', { completed: true }),
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('propagates update errors', async () => {
      (mockModel as any).findByIdAndUpdate.mockImplementationOnce(() => ({
        exec: jest.fn().mockRejectedValue(new Error('update err')),
      }));
      await expect(service.update(ID1, { completed: true })).rejects.toThrow(
        'update err',
      );
    });
  });

  describe('delete', () => {
    it('soft-deletes document and returns it', async () => {
      const res = await service.delete(ID1);
      expect((mockModel as any).findByIdAndUpdate).toHaveBeenCalledWith(
        ID1,
        { deleted: true },
        { new: true },
      );
      expect((res as any)._id).toBe(ID1);
      expect((res as any).deleted).toBe(true);
    });

    it('throws NotFoundException when deleting non-existent id', async () => {
      (mockModel as any).findByIdAndUpdate.mockImplementationOnce(() => ({
        exec: jest.fn().mockResolvedValue(null),
      }));
      await expect(
        service.delete('507f1f77bcf86cd799439099'),
      ).rejects.toBeInstanceOf(NotFoundException);
    });

    it('throws BadRequestException for invalid id format', async () => {
      await expect(service.delete('bad-id')).rejects.toBeInstanceOf(
        BadRequestException,
      );
    });

    it('propagates delete errors', async () => {
      (mockModel as any).findByIdAndUpdate.mockImplementationOnce(() => ({
        exec: jest.fn().mockRejectedValue(new Error('delete err')),
      }));
      await expect(service.delete(ID1)).rejects.toThrow('delete err');
    });
  });
});
