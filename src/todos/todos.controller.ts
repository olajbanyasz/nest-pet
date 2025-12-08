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
import * as todosService from './todos.service';

@Controller('todos')
export class TodosController {
  constructor(private readonly todosService: todosService.TodosService) {}
  @Get()
  findAll(@Query('completed') completed?: boolean): Array<todosService.Todo> {
    return this.todosService.findAll(completed);
  }

  @Get(':id')
  findOne(@Param('id') id: string): todosService.Todo | undefined {
    return this.todosService.findOne(+id);
  }

  @Post()
  create(@Body() todo: object): todosService.Todo {
    return this.todosService.create(
      todo as Omit<todosService.Todo, 'id' | 'completed'>,
    );
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() todoUpdate: object): object {
    return this.todosService.update(
      +id,
      todoUpdate as Partial<Omit<todosService.Todo, 'id'>>,
    )!;
  }

  @Delete(':id')
  delete(@Param('id') id: string): todosService.Todo | boolean {
    return this.todosService.delete(+id);
  }
}
