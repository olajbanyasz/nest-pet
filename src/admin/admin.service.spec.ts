/* eslint-disable @typescript-eslint/no-unused-vars */
import { Test, TestingModule } from '@nestjs/testing';
import { AdminService } from './admin.service';
import { getModelToken } from '@nestjs/mongoose';
import { User, UserRole } from '../users/schemas/user.schema';
import { NotFoundException } from '@nestjs/common';

type MockUser = {
  _id: string;
  email: string;
  password?: string;
  role: UserRole;
};

// Láncolható mock Mongoose metódusok
const createMockModel = (users?: MockUser[]) => {
  const exec = jest.fn();
  const select = jest.fn().mockReturnValue({ exec });
  const find = jest.fn().mockReturnValue({ select, exec });
  const findById = jest.fn().mockReturnValue({ select, exec });
  const findByIdAndDelete = jest.fn().mockReturnValue({ exec });
  const findByIdAndUpdate = jest.fn().mockReturnValue({ select, exec });

  return {
    find,
    findById,
    findByIdAndDelete,
    findByIdAndUpdate,
    select,
    exec,
  };
};

describe('AdminService', () => {
  let service: AdminService;
  let mockModel: ReturnType<typeof createMockModel>;

  const USER1: MockUser = {
    _id: '1',
    email: 'u1@test.com',
    role: UserRole.USER,
  };
  const USER2: MockUser = {
    _id: '2',
    email: 'u2@test.com',
    role: UserRole.ADMIN,
  };
  const users: MockUser[] = [USER1, USER2];

  beforeEach(async () => {
    mockModel = createMockModel(users);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminService,
        { provide: getModelToken(User.name), useValue: mockModel },
      ],
    }).compile();

    service = module.get<AdminService>(AdminService);
  });

  describe('getUsers', () => {
    it('should return all users without passwords', async () => {
      mockModel.exec.mockResolvedValue(users);

      const result = await service.getUsers();
      expect(result).toEqual(users);
      expect(mockModel.find).toHaveBeenCalled();
      expect(mockModel.select).toHaveBeenCalledWith('-password');
      expect(mockModel.exec).toHaveBeenCalled();
    });
  });

  describe('getUserById', () => {
    it('should return user when found', async () => {
      mockModel.exec.mockResolvedValue(USER1);

      const result = await service.getUserById('1');
      expect(result).toEqual(USER1);
      expect(mockModel.findById).toHaveBeenCalledWith('1');
    });

    it('should throw NotFoundException if user not found', async () => {
      mockModel.exec.mockResolvedValue(null);

      await expect(service.getUserById('nonexistent')).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });
  });

  describe('deleteUser', () => {
    it('should delete user when found', async () => {
      mockModel.exec.mockResolvedValue(USER1);

      const result = await service.deleteUser('1');
      expect(result).toEqual({ message: 'User 1 deleted' });
      expect(mockModel.findByIdAndDelete).toHaveBeenCalledWith('1');
    });

    it('should throw NotFoundException if user not found', async () => {
      mockModel.exec.mockResolvedValue(null);

      await expect(service.deleteUser('nonexistent')).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });
  });

  describe('promoteToAdmin', () => {
    it('should promote user to admin', async () => {
      const promotedUser = { ...USER1, role: UserRole.ADMIN };
      mockModel.exec.mockResolvedValue(promotedUser);

      const result = await service.promoteToAdmin('1');
      expect(result.role).toBe(UserRole.ADMIN);
      expect(mockModel.findByIdAndUpdate).toHaveBeenCalledWith(
        '1',
        { role: UserRole.ADMIN },
        { new: true },
      );
    });

    it('should throw NotFoundException if user not found', async () => {
      mockModel.exec.mockResolvedValue(null);

      await expect(
        service.promoteToAdmin('nonexistent'),
      ).rejects.toBeInstanceOf(NotFoundException);
    });
  });
});
