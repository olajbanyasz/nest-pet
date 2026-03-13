import { CACHE_MANAGER, CacheTTL } from '@nestjs/cache-manager';
import {
  ForbiddenException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import type { Cache } from 'cache-manager';
import mongoose, { FilterQuery, Model } from 'mongoose';

import { TodosService } from '../todos/todos.service';
import { User, UserDocument, UserRole } from '../users/schemas/user.schema';

@Injectable()
@CacheTTL(60 * 1000)
export class AdminService {
  private readonly logger = new Logger(AdminService.name);

  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
    private readonly todoService: TodosService,
    @Inject(CACHE_MANAGER)
    private cacheManager: Cache,
  ) {}

  async getUsers(
    email?: string,
    deleted: boolean | 'all' = false,
  ): Promise<(User & { lastLogin?: Date; todoCount: number })[]> {
    const deletedKey =
      deleted === 'all' ? 'all' : deleted ? 'deleted' : 'active';
    const cacheKey = email
      ? `users_email_${email}_${deletedKey}`
      : `users_all_${deletedKey}`;

    const cached =
      await this.cacheManager.get<
        (User & { lastLogin?: Date; todoCount: number })[]
      >(cacheKey);

    if (cached !== undefined) {
      this.logger.log(`Returning cached users for key: ${cacheKey}`);
      return cached;
    }

    const filter: FilterQuery<UserDocument> = {};

    if (deleted !== 'all') {
      filter.deleted = deleted === true ? true : { $ne: true };
    }

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

    await this.cacheManager.set(cacheKey, usersWithExtras, 60 * 1000);

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

  async reactivateUser(id: string): Promise<User> {
    const user = await this.userModel.findById(id);

    if (!user) {
      this.logger.warn(`Reactivate failed, user not found: ${id}`);
      throw new NotFoundException('User not found');
    }

    if (!user.inactive) {
      this.logger.warn(`User already active: ${id}`);
      return this.userModel
        .findById(id)
        .select('-password')
        .exec() as Promise<User>;
    }

    user.inactive = false;
    user.inactiveAt = undefined;
    user.inactiveReason = undefined;
    user.reactivatedAt = new Date();
    await user.save();

    this.logger.log(`User reactivated: ${id}`);

    await this.cacheManager.del(`users_email_${user.email}_active`);
    await this.cacheManager.del(`users_email_${user.email}_deleted`);
    await this.cacheManager.del(`users_email_${user.email}_all`);
    await this.cacheManager.del('users_all_active');
    await this.cacheManager.del('users_all_deleted');
    await this.cacheManager.del('users_all_all');
    await this.cacheManager.del('admin_details');

    return this.userModel
      .findById(id)
      .select('-password')
      .exec() as Promise<User>;
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

    user.deleted = true;
    user.deletedAt = new Date();
    user.deletedReason = 'Admin soft delete';
    await user.save();

    this.logger.log(`User soft-deleted: ${id}`);

    await this.cacheManager.del(`users_email_${user.email}_active`);
    await this.cacheManager.del(`users_email_${user.email}_deleted`);
    await this.cacheManager.del(`users_email_${user.email}_all`);
    await this.cacheManager.del('users_all_active');
    await this.cacheManager.del('users_all_deleted');
    await this.cacheManager.del('users_all_all');
    await this.cacheManager.del('admin_details');

    return { message: `User ${id} deleted` };
  }

  async restoreUser(id: string): Promise<User> {
    const user = await this.userModel.findById(id);

    if (!user) {
      this.logger.warn(`Restore failed, user not found: ${id}`);
      throw new NotFoundException('User not found');
    }

    if (!user.deleted) {
      this.logger.warn(`User already active: ${id}`);
      return this.userModel
        .findById(id)
        .select('-password')
        .exec() as Promise<User>;
    }

    user.deleted = false;
    user.deletedAt = undefined;
    user.deletedReason = undefined;
    await user.save();

    this.logger.log(`User restored: ${id}`);

    await this.cacheManager.del(`users_email_${user.email}_active`);
    await this.cacheManager.del(`users_email_${user.email}_deleted`);
    await this.cacheManager.del(`users_email_${user.email}_all`);
    await this.cacheManager.del('users_all_active');
    await this.cacheManager.del('users_all_deleted');
    await this.cacheManager.del('users_all_all');
    await this.cacheManager.del('admin_details');

    return this.userModel
      .findById(id)
      .select('-password')
      .exec() as Promise<User>;
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

    await this.cacheManager.del(`users_email_${user.email}_active`);
    await this.cacheManager.del(`users_email_${user.email}_deleted`);
    await this.cacheManager.del(`users_email_${user.email}_all`);
    await this.cacheManager.del('users_all_active');
    await this.cacheManager.del('users_all_deleted');
    await this.cacheManager.del('users_all_all');
    await this.cacheManager.del('admin_details');

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

    await this.cacheManager.del(`users_email_${user.email}_active`);
    await this.cacheManager.del(`users_email_${user.email}_deleted`);
    await this.cacheManager.del(`users_email_${user.email}_all`);
    await this.cacheManager.del('users_all_active');
    await this.cacheManager.del('users_all_deleted');
    await this.cacheManager.del('users_all_all');

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
    const cacheKey = 'admin_details';
    const cached = await this.cacheManager.get<{
      totalUsers: number;
      totalAdmins: number;
      totalTodos: number;
      totalCompletedTodos: number;
      totalActiveTodos: number;
      totalDeletedTodos: number;
    }>(cacheKey);

    if (cached !== undefined) {
      this.logger.log(`Returning cached admin details for key: ${cacheKey}`);
      return cached;
    }

    const totalUsers = await this.userModel.countDocuments({
      role: UserRole.USER,
      deleted: { $ne: true },
    });
    const totalAdmins = await this.userModel.countDocuments({
      role: UserRole.ADMIN,
      deleted: { $ne: true },
    });
    const totalTodos = await this.todoService.countAllTodos();
    const totalCompletedTodos = await this.todoService.countCompletedTodos();
    const totalActiveTodos = await this.todoService.countActiveTodos();
    const totalDeletedTodos = await this.todoService.countDeletedTodos();

    const details = {
      totalUsers,
      totalAdmins,
      totalTodos,
      totalCompletedTodos,
      totalActiveTodos,
      totalDeletedTodos,
    };

    await this.cacheManager.set(cacheKey, details, 60 * 1000);
    this.logger.log(`Cached admin details for key: ${cacheKey}`);

    return details;
  }
}
