import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import type { AuthenticatedUser } from '../auth/jwt.strategy';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { User } from '../auth/user.decorator';
import { UserRole } from '../users/schemas/user.schema';
import { CreateTodoDto } from './dto/create-todo.dto';
import { TodosService } from './todos.service';

@ApiTags('todos')
@Controller('todos')
export class TodosController {
  constructor(private readonly todosService: TodosService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  async findAll(
    @User() user: AuthenticatedUser,
    @Query('completed') completed?: string,
  ) {
    const completedBool =
      completed === undefined ? undefined : completed === 'true';
    return this.todosService.findAll(user.userId, completedBool);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async findOne(@User() user: AuthenticatedUser, @Param('id') id: string) {
    return this.todosService.findOne(id, user.userId);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(@User() user: AuthenticatedUser, @Body() todo: CreateTodoDto) {
    return this.todosService.create(todo, user.userId);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  async update(
    @User() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() todoUpdate: Partial<CreateTodoDto>,
  ) {
    return this.todosService.update(id, user.userId, todoUpdate);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async delete(@User() user: AuthenticatedUser, @Param('id') id: string) {
    return this.todosService.delete(id, user.userId);
  }

  @Get('stats/last-14-days')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  getLast14DaysStats() {
    return this.todosService.getLast14DaysStats();
  }
}
