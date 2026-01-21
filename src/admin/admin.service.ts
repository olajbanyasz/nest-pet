import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument, UserRole } from '../users/schemas/user.schema';
import { TodosService } from '../todos/todos.service';

@Injectable()
export class AdminService {
  private readonly logger = new Logger(AdminService.name);

  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
    private readonly todoService: TodosService,
  ) {}

  async getUsers(): Promise<User[]> {
    this.logger.log('Fetching all users');
    return this.userModel.find().select('-password').exec();
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

    return this.userModel
      .findById(id)
      .select('-password')
      .exec() as Promise<User>;
  }
}
