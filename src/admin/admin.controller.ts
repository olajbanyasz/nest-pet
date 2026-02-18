import { CacheInterceptor, CacheTTL } from '@nestjs/cache-manager';
import {
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Param,
  Patch,
  Query,
  Req,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { UserRole } from '../users/schemas/user.schema';
import { AdminService } from './admin.service';

@ApiTags('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@UseInterceptors(CacheInterceptor)
@CacheTTL(60)
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('users')
  getUsers(@Query('email') email?: string) {
    return this.adminService.getUsers(email);
  }

  @Get('users/:id')
  getUser(@Param('id') id: string) {
    return this.adminService.getUserById(id);
  }

  @Delete('users/:id')
  async deleteUser(@Param('id') id: string, @Req() req: Request) {
    if (req.user?.userId === id) {
      throw new ForbiddenException('Cannot delete self');
    }
    return this.adminService.deleteUser(id);
  }

  @Patch('users/:id/promote')
  async promoteUser(@Param('id') id: string, @Req() req: Request) {
    if (req.user?.userId === id) {
      throw new ForbiddenException('Cannot promote self');
    }
    return this.adminService.promoteToAdmin(id);
  }

  @Patch('users/:id/demote')
  async demoteUser(@Param('id') id: string, @Req() req: Request) {
    if (req.user?.userId === id) {
      throw new ForbiddenException('Cannot demote self');
    }
    return this.adminService.demoteToUser(id);
  }

  @Get('details')
  getApplicationDetails() {
    return this.adminService.getApplicationDetails();
  }
}
