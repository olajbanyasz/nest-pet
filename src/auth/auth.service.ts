/* eslint-disable @typescript-eslint/require-await */
import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { User, UserDocument, UserRole } from '../users/schemas/user.schema';
import { RegisterDto, LoginDto } from './dto/auth.dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto): Promise<{ access_token: string }> {
    const { email, password } = registerDto;

    const existingUser = await this.userModel.findOne({ email });
    if (existingUser) {
      throw new ConflictException('User already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new this.userModel({
      email,
      password: hashedPassword,
      role: UserRole.USER,
    });

    await user.save();

    const payload = {
      sub: String(user._id),
      email: user.email,
      role: user.role,
    };

    this.logger.log(
      `User ${String(user._id)} registered with role ${user.role}`,
    );

    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async login(loginDto: LoginDto): Promise<{ access_token: string }> {
    const { email, password } = loginDto;

    const user = await this.userModel.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = {
      sub: String(user._id),
      email: user.email,
      role: user.role,
    };

    this.logger.log(
      `User ${String(user._id)} logged in with role ${user.role}`,
    );

    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async logout(): Promise<{ message: string }> {
    this.logger.log('User logged out');
    return { message: 'Logout successful' };
  }
}
