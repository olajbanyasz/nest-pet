import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  Logger,
  Inject,
} from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';

import { InjectModel } from '@nestjs/mongoose';
import mongoose, { FilterQuery, Model } from 'mongoose';
import { User, UserDocument, UserRole } from '../users/schemas/user.schema';
import { TodosService } from '../todos/todos.service';

@Injectable()
export class AdminService {
  private readonly logger = new Logger(AdminService.name);

  constructor(
    @InjectModel(User.name)
    @Inject(CACHE_MANAGER)
    private cacheManager: Cache,
    private readonly userModel: Model<UserDocument>,
    private readonly todoService: TodosService,
  ) {}

  async getUsers(
    email?: string,
  ): Promise<(User & { lastLogin?: Date; todoCount: number })[]> {
    const cacheKey = email ? `users_email_${email}` : 'users_all';
    const cached =
      await this.cacheManager.get<
        (User & { lastLogin?: Date; todoCount: number })[]
      >(cacheKey);

    if (cached) {
      this.logger.log(`Returning cached users for key: ${cacheKey}`);
      return cached;
    }
    const filter: FilterQuery<UserDocument> = {};

    if (email && email.trim().length > 2) {
      filter.email = {
        $regex: email,
        $options: 'i',
      };
    }

    const users = await this.userModel.find(filter).select('-password').exec();

    const usersWithExtras = await Promise.all(
      users.map(async (user) => {
        const todoCount = await this.todoService.countTodosByUser(
          new mongoose.Types.ObjectId(user._id),
        );

        return {
          ...user.toObject(),
          lastLoginAt: user.lastLoginAt,
          todoCount,
        };
      }),
    );

    await this.cacheManager.set(cacheKey, usersWithExtras, 60);

    this.logger.log(`Cached users for key: ${cacheKey}`);

    return usersWithExtras;
  }

  async getUserById(id: string): Promise<User> {
    const user = await this.userModel.findById(id).select('-password').exec();

    if (!user) {
      this.logger.warn(`User not found: ${id}`);
      throw new NotFoundException('User not found');
    }

    this.logger.log(`Fetched user ${id}`);
    return user;
  }

  async deleteUser(id: string): Promise<{ message: string }> {
    const user = await this.userModel.findById(id);

    if (!user) {
      this.logger.warn(`Delete failed, user not found: ${id}`);
      throw new NotFoundException('User not found');
    }

    if (user.role === UserRole.ADMIN) {
      this.logger.warn(`Attempt to delete admin user: ${id}`);
      throw new ForbiddenException('Admin users cannot be deleted');
    }

    await this.todoService.deleteTodosByUser(id);

    await this.userModel.findByIdAndDelete(id).exec();

    this.logger.log(`User deleted: ${id}`);

    await this.cacheManager.del(`users_email_${user.email}`);
    await this.cacheManager.del('users_all');

    return { message: `User ${id} deleted` };
  }

  async promoteToAdmin(id: string): Promise<User> {
    const user = await this.userModel.findById(id);

    if (!user) {
      this.logger.warn(`Promote failed, user not found: ${id}`);
      throw new NotFoundException('User not found');
    }

    if (user.role === UserRole.ADMIN) {
      this.logger.warn(`User already admin: ${id}`);
      return user;
    }

    user.role = UserRole.ADMIN;
    await user.save();

    this.logger.log(`User promoted to admin: ${id}`);

    await this.cacheManager.del(`users_email_${user.email}`);
    await this.cacheManager.del('users_all');

    return this.userModel
      .findById(id)
      .select('-password')
      .exec() as Promise<User>;
  }

  async demoteToUser(id: string): Promise<User> {
    const user = await this.userModel.findById(id);

    if (!user) {
      this.logger.warn(`Demote failed, user not found: ${id}`);
      throw new NotFoundException('User not found');
    }

    if (user.role === UserRole.USER) {
      this.logger.warn(`User already regular user: ${id}`);
      return user;
    }

    user.role = UserRole.USER;
    await user.save();

    this.logger.log(`Admin demoted to user: ${id}`);

    await this.cacheManager.del(`users_email_${user.email}`);
    await this.cacheManager.del('users_all');

    return this.userModel
      .findById(id)
      .select('-password')
      .exec() as Promise<User>;
  }

  async getApplicationDetails(): Promise<{
    totalUsers: number;
    totalAdmins: number;
    totalTodos: number;
    totalCompletedTodos: number;
    totalActiveTodos: number;
    totalDeletedTodos: number;
  }> {
    const totalUsers = await this.userModel.countDocuments({
      role: UserRole.USER,
    });
    const totalAdmins = await this.userModel.countDocuments({
      role: UserRole.ADMIN,
    });
    const totalTodos = await this.todoService.countAllTodos();
    const totalCompletedTodos = await this.todoService.countCompletedTodos();
    const totalActiveTodos = await this.todoService.countActiveTodos();
    const totalDeletedTodos = await this.todoService.countDeletedTodos();

    return {
      totalUsers,
      totalAdmins,
      totalTodos,
      totalCompletedTodos,
      totalActiveTodos,
      totalDeletedTodos,
    };
  }
}
