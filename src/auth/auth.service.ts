/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
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
    const { email, password, name } = registerDto;

    try {
      const existingUser = await this.userModel.findOne({ email });
      if (existingUser) {
        this.logger.warn(`Registration failed, user already exists: ${email}`);
        throw new ConflictException('User already exists');
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const user = new this.userModel({
        email,
        password: hashedPassword,
        role: UserRole.USER,
        name,
      });

      await user.save();

      const payload = {
        sub: String(user._id),
        email: user.email,
        role: user.role,
        name: user.name,
      };

      const token = this.jwtService.sign(payload);
      this.logger.log(`User registered: ${email} (id: ${user._id})`);

      return { access_token: token };
    } catch (error) {
      this.logger.error(
        `Registration error for ${email}: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async login(
    loginDto: LoginDto,
  ): Promise<{ access_token: string; user: UserDocument }> {
    const { email, password } = loginDto;

    try {
      const user = await this.userModel.findOne({ email });
      if (!user || !(await bcrypt.compare(password, user.password))) {
        this.logger.warn(`Invalid login attempt for email: ${email}`);
        throw new UnauthorizedException('Invalid credentials');
      }

      user.lastLoginAt = new Date();
      await user.save();

      const payload = {
        sub: String(user._id),
        email: user.email,
        role: user.role,
        name: user.name,
      };

      const token = this.jwtService.sign(payload);

      this.logger.log(
        `User logged in: ${email} (id: ${user._id}, role: ${user.role})`,
      );

      return { access_token: token, user };
    } catch (error) {
      if (!(error instanceof UnauthorizedException)) {
        this.logger.error(
          `Login error for ${email}: ${error.message}`,
          error.stack,
        );
      }
      throw error;
    }
  }

  async logout(user?: UserDocument): Promise<{ message: string }> {
    if (user) {
      this.logger.log(`User logged out: ${user.email} (id: ${user._id})`);
    } else {
      this.logger.log('User logged out (unknown user)');
    }
    return { message: 'Logout successful' };
  }
}
