/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { UserRole } from '../users/schemas/user.schema';
import { NotFoundException } from '@nestjs/common';

type MockUser = {
  _id: string;
  email: string;
  role: UserRole;
};

describe('AdminController', () => {
  let controller: AdminController;
  let service: AdminService;

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
    const mockService: Partial<Record<keyof AdminService, jest.Mock>> = {
      getUsers: jest.fn(),
      getUserById: jest.fn(),
      deleteUser: jest.fn(),
      promoteToAdmin: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdminController],
      providers: [{ provide: AdminService, useValue: mockService }],
    }).compile();

    controller = module.get<AdminController>(AdminController);
    service = module.get<AdminService>(AdminService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getUsers', () => {
    it('should return all users', async () => {
      (service.getUsers as jest.Mock).mockResolvedValue(users);

      const result = await controller.getUsers();
      expect(result).toEqual(users);
      expect(service.getUsers).toHaveBeenCalled();
    });
  });

  describe('getUser', () => {
    it('should return a user by id', async () => {
      (service.getUserById as jest.Mock).mockResolvedValue(USER1);

      const result = await controller.getUser('1');
      expect(result).toEqual(USER1);
      expect(service.getUserById).toHaveBeenCalledWith('1');
    });

    it('should throw NotFoundException if user not found', async () => {
      (service.getUserById as jest.Mock).mockRejectedValue(
        new NotFoundException(),
      );

      await expect(controller.getUser('nonexistent')).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });
  });

  describe('deleteUser', () => {
    it('should delete a user', async () => {
      const msg = { message: 'User 1 deleted' };
      (service.deleteUser as jest.Mock).mockResolvedValue(msg);

      const result = await controller.deleteUser('1');
      expect(result).toEqual(msg);
      expect(service.deleteUser).toHaveBeenCalledWith('1');
    });

    it('should throw NotFoundException if user not found', async () => {
      (service.deleteUser as jest.Mock).mockRejectedValue(
        new NotFoundException(),
      );

      await expect(controller.deleteUser('nonexistent')).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });
  });

  describe('promoteUser', () => {
    it('should promote a user to admin', async () => {
      const promoted = { ...USER1, role: UserRole.ADMIN };
      (service.promoteToAdmin as jest.Mock).mockResolvedValue(promoted);

      const result = await controller.promoteUser('1');
      expect(result).toEqual(promoted);
      expect(service.promoteToAdmin).toHaveBeenCalledWith('1');
    });

    it('should throw NotFoundException if user not found', async () => {
      (service.promoteToAdmin as jest.Mock).mockRejectedValue(
        new NotFoundException(),
      );

      await expect(
        controller.promoteUser('nonexistent'),
      ).rejects.toBeInstanceOf(NotFoundException);
    });
  });
});
