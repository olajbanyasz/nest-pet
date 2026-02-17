import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import { TokenExpiryService } from './token-expiry.service';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';

import { User, UserDocument, UserRole } from '../users/schemas/user.schema';
import { RegisterDto, LoginDto } from './dto/auth.dto';
import {
  RefreshToken,
  RefreshTokenDocument,
} from './schemas/refresh-token.schema';
import { JwtPayload } from './jwt.strategy';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,

    @InjectModel(RefreshToken.name)
    private readonly refreshTokenModel: Model<RefreshTokenDocument>,

    private readonly jwtService: JwtService,
    private readonly tokenExpiryService: TokenExpiryService,
  ) {}

  async register(registerDto: RegisterDto): Promise<{
    access_token: string;
    refresh_token: string;
    user: UserDocument;
  }> {
    const { email, password, name } = registerDto;

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

    const accessToken = await this.generateAccessToken(user);
    const refreshToken = await this.generateRefreshToken(user._id);

    this.logger.log(`User registered: ${email} (id: ${user._id.toString()})`);

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
      user,
    };
  }

  async login(loginDto: LoginDto): Promise<{
    access_token: string;
    refresh_token: string;
    user: UserDocument;
  }> {
    const { email, password } = loginDto;

    const user = await this.userModel.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      this.logger.warn(`Invalid login attempt for email: ${email}`);
      throw new UnauthorizedException('Invalid credentials');
    }

    user.lastLoginAt = new Date();
    await user.save();

    const accessToken = await this.generateAccessToken(user);
    const refreshToken = await this.generateRefreshToken(user._id);

    const decoded: JwtPayload | null = this.jwtService.decode(accessToken);

    if (decoded && decoded.exp) {
      const expiresInMs = decoded.exp * 1000 - Date.now();
      this.tokenExpiryService.scheduleTokenExpiryWarning(
        user._id.toString(),
        expiresInMs,
      );
    } else {
      this.logger.warn(
        `Could not decode exp from access token for user ${user._id.toString()}`,
      );
    }

    this.logger.log(
      `User logged in: ${email} (id: ${user._id.toString()}, role: ${user.role})`,
    );

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
      user,
    };
  }

  async logout(userId?: string): Promise<{ message: string }> {
    if (userId) {
      await this.refreshTokenModel.deleteMany({
        userId: new Types.ObjectId(userId),
      });

      this.logger.log(`User logged out: ${userId}`);
    } else {
      this.logger.log('User logged out (unknown user)');
    }

    return { message: 'Logout successful' };
  }

  async refreshTokens(refreshToken: string | undefined): Promise<{
    access_token: string;
    refresh_token: string;
  }> {
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token not found');
    }

    const [tokenId, tokenSecret] = refreshToken.split(':');

    if (!tokenId || !tokenSecret) {
      throw new UnauthorizedException('Invalid refresh token format');
    }

    const matchedToken = await this.refreshTokenModel.findOne({
      tokenId,
      expiresAt: { $gt: new Date() },
    });

    if (!matchedToken) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const isMatch = await bcrypt.compare(tokenSecret, matchedToken.tokenHash);
    if (!isMatch) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    await this.refreshTokenModel.deleteOne({ _id: matchedToken._id });

    const user = await this.userModel.findById(matchedToken.userId);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const newAccessToken = await this.generateAccessToken(user);
    const newRefreshToken = await this.generateRefreshToken(user._id);

    const decoded = this.jwtService.decode(newAccessToken);
    if (decoded?.exp) {
      const expiresInMs = decoded.exp * 1000 - Date.now();
      this.tokenExpiryService.scheduleTokenExpiryWarning(
        user._id.toString(),
        expiresInMs,
      );
    } else {
      this.logger.warn(
        `Could not decode exp from access token for user ${user._id.toString()}`,
      );
    }

    return {
      access_token: newAccessToken,
      refresh_token: newRefreshToken,
    };
  }

  private async generateAccessToken(user: UserDocument): Promise<string> {
    return this.jwtService.signAsync(
      {
        sub: user._id.toString(),
        email: user.email,
        role: user.role,
        name: user.name,
      },
      { expiresIn: '15m' },
    );
  }

  private async generateRefreshToken(userId: Types.ObjectId): Promise<string> {
    const tokenId = crypto.randomUUID();
    const tokenSecret = crypto.randomBytes(32).toString('hex');
    const tokenHash = await bcrypt.hash(tokenSecret, 10);

    await this.refreshTokenModel.create({
      userId,
      tokenId,
      tokenHash,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    return `${tokenId}:${tokenSecret}`;
  }
}
