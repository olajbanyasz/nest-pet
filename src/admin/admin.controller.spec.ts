import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Request } from 'express';

import { UserRole } from '../users/schemas/user.schema';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';

type AuthRequestMock = {
  user: {
    userId: string;
    role: UserRole;
  };
};

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

  const mockCacheManager = {
    get: jest.fn(),
    set: jest.fn(),
    del: jest.fn(),
  };

  beforeEach(async () => {
    const mockService: Partial<Record<keyof AdminService, jest.Mock>> = {
      getUsers: jest.fn(),
      getUserById: jest.fn(),
      deleteUser: jest.fn(),
      promoteToAdmin: jest.fn(),
      demoteToUser: jest.fn(),
      getApplicationDetails: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdminController],
      providers: [
        { provide: AdminService, useValue: mockService },
        { provide: CACHE_MANAGER, useValue: mockCacheManager },
      ],
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
      expect(service['getUsers']).toHaveBeenCalled();
    });
  });

  describe('getUser', () => {
    it('should return a user by id', async () => {
      (service.getUserById as jest.Mock).mockResolvedValue(USER1);
      const result = await controller.getUser('1');
      expect(result).toEqual(USER1);
      expect(service['getUserById']).toHaveBeenCalledWith('1');
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
    it('should delete a user if not self', async () => {
      const reqMock: AuthRequestMock = {
        user: { userId: '2', role: UserRole.ADMIN },
      };
      const msg = { message: 'User 1 deleted' };
      (service.deleteUser as jest.Mock).mockResolvedValue(msg);

      const result = await controller.deleteUser(
        '1',
        reqMock as unknown as Request,
      );
      expect(result).toEqual(msg);
      expect(service['deleteUser']).toHaveBeenCalledWith('1');
    });

    it('should throw ForbiddenException if trying to delete self', async () => {
      const reqMock: AuthRequestMock = {
        user: { userId: '1', role: UserRole.ADMIN },
      };
      await expect(
        controller.deleteUser('1', reqMock as unknown as Request),
      ).rejects.toBeInstanceOf(ForbiddenException);
    });
  });

  describe('promoteUser', () => {
    it('should promote a user to admin if not self', async () => {
      const reqMock: AuthRequestMock = {
        user: { userId: '2', role: UserRole.ADMIN },
      };
      const promoted = { ...USER1, role: UserRole.ADMIN };
      (service.promoteToAdmin as jest.Mock).mockResolvedValue(promoted);

      const result = await controller.promoteUser(
        '1',
        reqMock as unknown as Request,
      );
      expect(result).toEqual(promoted);
      expect(service['promoteToAdmin']).toHaveBeenCalledWith('1');
    });

    it('should throw ForbiddenException if trying to promote self', async () => {
      const reqMock: AuthRequestMock = {
        user: { userId: '1', role: UserRole.ADMIN },
      };
      await expect(
        controller.promoteUser('1', reqMock as unknown as Request),
      ).rejects.toBeInstanceOf(ForbiddenException);
    });
  });

  describe('demoteUser', () => {
    it('should demote a user to normal if not self', async () => {
      const reqMock: AuthRequestMock = {
        user: { userId: '1', role: UserRole.ADMIN },
      };
      const demoted = { ...USER2, role: UserRole.USER };
      (service.demoteToUser as jest.Mock).mockResolvedValue(demoted);

      const result = await controller.demoteUser(
        '2',
        reqMock as unknown as Request,
      );
      expect(result).toEqual(demoted);
      expect(service['demoteToUser']).toHaveBeenCalledWith('2');
    });

    it('should throw ForbiddenException if trying to demote self', async () => {
      const reqMock: AuthRequestMock = {
        user: { userId: '2', role: UserRole.ADMIN },
      };
      await expect(
        controller.demoteUser('2', reqMock as unknown as Request),
      ).rejects.toBeInstanceOf(ForbiddenException);
    });
  });
  describe('getApplicationDetails', () => {
    it('should return app details', async () => {
      const details = {
        totalUsers: 1,
        totalAdmins: 1,
        totalTodos: 10,
        totalCompletedTodos: 5,
        totalActiveTodos: 5,
        totalDeletedTodos: 2,
      };
      (service.getApplicationDetails as jest.Mock).mockResolvedValue(details);

      const result = await controller.getApplicationDetails();
      expect(result).toEqual(details);
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(service.getApplicationDetails).toHaveBeenCalled();
    });
  });
});
