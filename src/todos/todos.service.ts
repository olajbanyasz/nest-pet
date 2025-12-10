/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Todo, TodoDocument } from './schemas/todo.schema';
import { CreateTodoDto } from './dto/create-todo.dto';

@Injectable()
export class TodosService {
  constructor(@InjectModel(Todo.name) private todoModel: Model<TodoDocument>) {}

  async findAll(completed?: boolean): Promise<Todo[]> {
    const filter: any = { deleted: false };
    if (completed === true) filter.completed = true;
    if (completed === false) filter.completed = false;
    return this.todoModel.find(filter).exec();
  }

  async findOne(id: string): Promise<Todo | null> {
    return this.todoModel.findById(id).exec();
  }

  async create(createDto: CreateTodoDto): Promise<Todo> {
    const created = new this.todoModel(createDto);
    return created.save();
  }

  async update(
    id: string,
    todoUpdate: Partial<CreateTodoDto>,
  ): Promise<Todo | null> {
    return this.todoModel
      .findByIdAndUpdate(id, todoUpdate, { new: true })
      .exec();
  }

  async delete(id: string): Promise<Todo | null> {
    return this.todoModel
      .findByIdAndUpdate(id, { deleted: true }, { new: true })
      .exec();
  }
}
