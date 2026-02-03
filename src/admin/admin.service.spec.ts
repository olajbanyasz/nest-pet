import { Test, TestingModule } from '@nestjs/testing';
import { AdminService } from './admin.service';
import { getModelToken } from '@nestjs/mongoose';
import { User, UserRole } from '../users/schemas/user.schema';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { TodosService } from '../todos/todos.service';
import { CACHE_MANAGER } from '@nestjs/cache-manager';

const mockTodosService = {
  deleteTodosByUser: jest.fn().mockResolvedValue({ deletedCount: 0 }),
};

describe('AdminService', () => {
  let service: AdminService;

  const USER1 = {
    _id: '1',
    email: 'u1@test.com',
    role: UserRole.USER,
    save: jest.fn(),
  };
  const USER2 = {
    _id: '2',
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

      const result = await service.deleteUser('1');
      expect(result).toEqual({ message: 'User 1 deleted' });
      expect(mockTodosService.deleteTodosByUser).toHaveBeenCalledWith('1');
      expect(mockModel.findByIdAndDelete).toHaveBeenCalledWith('1');
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

      const result = await service.promoteToAdmin('1');
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

      const result = await service.demoteToUser('2');
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
});
