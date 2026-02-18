import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';

import { TodosService } from '../todos/todos.service';
import { User, UserRole } from '../users/schemas/user.schema';
import { AdminService } from './admin.service';

const mockTodosService: Record<string, jest.Mock> = {
  deleteTodosByUser: jest.fn().mockResolvedValue({ deletedCount: 0 }),
};

describe('AdminService', () => {
  let service: AdminService;

  const USER1 = {
    _id: '507f1f77bcf86cd799439011',
    email: 'u1@test.com',
    role: UserRole.USER,
    save: jest.fn(),
  };
  const USER2 = {
    _id: '507f1f77bcf86cd799439012',
    email: 'u2@test.com',
    role: UserRole.ADMIN,
    save: jest.fn(),
  };

  const mockCache = {
    get: jest.fn(),
    set: jest.fn(),
    del: jest.fn(),
  };

  const createQueryMock = (result: any) => ({
    select: jest.fn().mockReturnThis(),
    exec: jest.fn().mockResolvedValue(result),
  });

  const mockModel = {
    find: jest.fn().mockReturnValue(createQueryMock([USER1, USER2])),
    findById: jest.fn(),
    findByIdAndDelete: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminService,
        { provide: getModelToken(User.name), useValue: mockModel },
        { provide: TodosService, useValue: mockTodosService },
        { provide: CACHE_MANAGER, useValue: mockCache },
      ],
    }).compile();

    service = module.get<AdminService>(AdminService);
  });

  describe('deleteUser', () => {
    it('should delete user when found and not admin', async () => {
      mockModel.findById.mockResolvedValue(USER1);
      mockModel.findByIdAndDelete.mockReturnValue(createQueryMock(USER1));

      const result = await service.deleteUser('507f1f77bcf86cd799439011');
      expect(result).toEqual({
        message: 'User 507f1f77bcf86cd799439011 deleted',
      });

      expect(mockTodosService.deleteTodosByUser).toHaveBeenCalledWith(
        '507f1f77bcf86cd799439011',
      );

      expect(mockModel.findByIdAndDelete).toHaveBeenCalledWith(
        '507f1f77bcf86cd799439011',
      );
    });

    it('should throw NotFoundException if user not found', async () => {
      mockModel.findById.mockResolvedValue(null);
      await expect(service.deleteUser('nonexistent')).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });

    it('should throw ForbiddenException if user is admin', async () => {
      mockModel.findById.mockResolvedValue(USER2);
      await expect(service.deleteUser('2')).rejects.toBeInstanceOf(
        ForbiddenException,
      );
    });
  });

  describe('promoteToAdmin', () => {
    it('should promote user to admin', async () => {
      const user = { ...USER1, save: jest.fn().mockResolvedValue(true) };
      mockModel.findById.mockResolvedValueOnce(user);
      mockModel.findById.mockReturnValueOnce(
        createQueryMock({ ...user, role: UserRole.ADMIN }),
      );

      const result = await service.promoteToAdmin('507f1f77bcf86cd799439011');
      expect(result.role).toBe(UserRole.ADMIN);
      expect(user.save).toHaveBeenCalled();
    });

    it('should throw NotFoundException if user not found', async () => {
      mockModel.findById.mockResolvedValue(null);
      await expect(
        service.promoteToAdmin('nonexistent'),
      ).rejects.toBeInstanceOf(NotFoundException);
    });
  });

  describe('demoteToUser', () => {
    it('should demote admin to user', async () => {
      const user = { ...USER2, save: jest.fn().mockResolvedValue(true) };
      mockModel.findById.mockResolvedValueOnce(user);
      mockModel.findById.mockReturnValueOnce(
        createQueryMock({ ...user, role: UserRole.USER }),
      );

      const result = await service.demoteToUser('507f1f77bcf86cd799439012');
      expect(result.role).toBe(UserRole.USER);
      expect(user.save).toHaveBeenCalled();
    });

    it('should throw NotFoundException if user not found', async () => {
      mockModel.findById.mockResolvedValue(null);
      await expect(service.demoteToUser('nonexistent')).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });
  });

  describe('getUserById', () => {
    it('should return user when found', async () => {
      mockModel.findById.mockReturnValue(createQueryMock(USER1));
      const result = await service.getUserById('507f1f77bcf86cd799439011');
      expect(result).toEqual(USER1);
    });

    it('should throw NotFoundException if not found', async () => {
      mockModel.findById.mockReturnValue(createQueryMock(null));
      await expect(
        service.getUserById('507f1f77bcf86cd799439011'),
      ).rejects.toBeInstanceOf(NotFoundException);
    });
  });

  describe('getUsers', () => {
    it('should return cached users if available', async () => {
      mockCache.get.mockResolvedValue(['cached']);
      const result = await service.getUsers();
      expect(result).toEqual(['cached']);

      expect(mockModel.find).not.toHaveBeenCalled();
    });

    it('should fetch from DB and cache if NOT available in cache', async () => {
      mockCache.get.mockResolvedValue(undefined);
      const userObj = { ...USER1, toObject: jest.fn().mockReturnValue(USER1) };
      mockModel.find.mockReturnValue(createQueryMock([userObj]));
      // Mock countTodosByUser specifically
      mockTodosService.countTodosByUser = jest.fn().mockResolvedValue(0);

      const result = await service.getUsers();

      expect(result).toBeDefined();
      expect(result[0].todoCount).toBe(0);
      expect(mockCache.set).toHaveBeenCalled();
    });
  });

  describe('getApplicationDetails', () => {
    it('should return aggregate stats', async () => {
      mockModel['countDocuments'] = jest.fn().mockResolvedValue(5);
      mockTodosService.countAllTodos = jest.fn().mockResolvedValue(10);
      mockTodosService.countCompletedTodos = jest.fn().mockResolvedValue(4);
      mockTodosService.countActiveTodos = jest.fn().mockResolvedValue(6);
      mockTodosService.countDeletedTodos = jest.fn().mockResolvedValue(2);

      const result = await service.getApplicationDetails();

      expect(result.totalUsers).toBe(5);
      expect(result.totalTodos).toBe(10);
    });
  });
});
