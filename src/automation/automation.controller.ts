import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import type { AuthenticatedUser } from '../auth/jwt.strategy';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { User } from '../auth/user.decorator';
import { AutomationService } from './automation.service';

@ApiTags('automation')
@UseGuards(JwtAuthGuard)
@Controller('automation')
export class AutomationController {
  constructor(private readonly automationService: AutomationService) {}

  @Get('me/todo-completion-stats')
  getMyTodoCompletionStats(@User() user: AuthenticatedUser) {
    return this.automationService.getUserTodoCompletionStats(user.userId);
  }
}
