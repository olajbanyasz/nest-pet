import {
  Body,
  Controller,
  Get,
  Patch,
  Delete,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { TodosService } from './todos.service';
import { CreateTodoDto } from './dto/create-todo.dto';
import { User } from '../auth/user.decorator';

@Controller('todos')
export class TodosController {
  constructor(private readonly todosService: TodosService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  async findAll(
    @User() user: { userId: string },
    @Query('completed') completed?: string,
  ) {
    const completedBool =
      completed === undefined ? undefined : completed === 'true';
    return this.todosService.findAll(user.userId, completedBool);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async findOne(@User() user: { userId: string }, @Param('id') id: string) {
    return this.todosService.findOne(id, user.userId);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(@User() user: { userId: string }, @Body() todo: CreateTodoDto) {
    return this.todosService.create(todo, user.userId);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  async update(
    @User() user: { userId: string },
    @Param('id') id: string,
    @Body() todoUpdate: Partial<CreateTodoDto>,
  ) {
    return this.todosService.update(id, user.userId, todoUpdate);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async delete(@User() user: { userId: string }, @Param('id') id: string) {
    return this.todosService.delete(id, user.userId);
  }
}
