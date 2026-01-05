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

@Controller('todos')
export class TodosController {
  constructor(private readonly todosService: TodosService) {}

  @Get()
  async findAll(@Query('completed') completed?: string) {
    const completedBool =
      completed === undefined ? undefined : completed === 'true';
    return this.todosService.findAll(completedBool);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.todosService.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(@Body() todo: CreateTodoDto) {
    return this.todosService.create(todo);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  async update(
    @Param('id') id: string,
    @Body() todoUpdate: Partial<CreateTodoDto>,
  ) {
    return this.todosService.update(id, todoUpdate);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async delete(@Param('id') id: string) {
    return this.todosService.delete(id);
  }
}
