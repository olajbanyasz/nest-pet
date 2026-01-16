import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument, UserRole } from '../users/schemas/user.schema';

@Injectable()
export class AdminService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async getUsers(): Promise<User[]> {
    return this.userModel.find().select('-password').exec(); // jelszó nélkül
  }

  async getUserById(id: string): Promise<User> {
    const user = await this.userModel.findById(id).select('-password').exec();
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async deleteUser(id: string): Promise<{ message: string }> {
    const result = await this.userModel.findByIdAndDelete(id).exec();
    if (!result) throw new NotFoundException('User not found');
    return { message: `User ${id} deleted` };
  }

  async promoteToAdmin(id: string): Promise<User> {
    const user = await this.userModel
      .findByIdAndUpdate(id, { role: UserRole.ADMIN }, { new: true })
      .select('-password')
      .exec();

    if (!user) throw new NotFoundException('User not found');
    return user;
  }
}
