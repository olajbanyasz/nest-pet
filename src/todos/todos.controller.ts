import {
  Body,
  Controller,
  Get,
  Patch,
  Delete,
  Param,
  Post,
  Query,
} from '@nestjs/common';
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
  async create(@Body() todo: CreateTodoDto) {
    return this.todosService.create(todo);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() todoUpdate: Partial<CreateTodoDto>,
  ) {
    return this.todosService.update(id, todoUpdate);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.todosService.delete(id);
  }
}
