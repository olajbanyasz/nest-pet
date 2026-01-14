import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, isValidObjectId } from 'mongoose';
import { Todo, TodoDocument } from './schemas/todo.schema';
import { CreateTodoDto } from './dto/create-todo.dto';

@Injectable()
export class TodosService {
  constructor(@InjectModel(Todo.name) private todoModel: Model<TodoDocument>) {}

  async findAll(userId: string, completed?: boolean): Promise<Todo[]> {
    const filter: Partial<Todo> & { deleted: boolean } = {
      userId,
      deleted: false,
    };
    if (completed === true) filter.completed = true;
    if (completed === false) filter.completed = false;
    return this.todoModel.find(filter).exec();
  }

  async findOne(id: string, userId: string): Promise<Todo> {
    if (!isValidObjectId(id)) {
      throw new BadRequestException('Invalid id format');
    }
    const todo = await this.todoModel.findOne({
      _id: id,
      userId,
    });
    if (!todo) {
      throw new NotFoundException(`Todo with id "${id}" not found`);
    }
    return todo;
  }

  async create(createDto: CreateTodoDto, userId: string): Promise<Todo> {
    try {
      const newTodo = new this.todoModel({
        ...createDto,
        userId,
      });
      return await newTodo.save();
    } catch (error: unknown) {
      if (isValidationError(error)) {
        const messages = Object.values(error.errors)
          .map((err: any) => (err as { message: string }).message)
          .join(', ');
        throw new BadRequestException(`Validation error: ${messages}`);
      }
      throw error;
    }
  }

  async update(
    id: string,
    userId: string,
    todoUpdate: Partial<CreateTodoDto>,
  ): Promise<Todo> {
    if (!isValidObjectId(id)) {
      throw new BadRequestException('Invalid id format');
    }
    const updated = await this.todoModel
      .findByIdAndUpdate({ _id: id, userId }, todoUpdate, { new: true })
      .exec();
    if (!updated) {
      throw new NotFoundException(`Todo with id "${id}" not found`);
    }
    return updated;
  }

  async delete(id: string, userId): Promise<Todo> {
    if (!isValidObjectId(id)) {
      throw new BadRequestException('Invalid id format');
    }
    const deleted = await this.todoModel
      .findOneAndUpdate({ _id: id, userId }, { deleted: true }, { new: true })
      .exec();
    if (!deleted) {
      throw new NotFoundException(`Todo with id "${id}" not found`);
    }
    return deleted;
  }
}

function isValidationError(
  error: unknown,
): error is { name: string; errors: Record<string, { message: string }> } {
  if (typeof error !== 'object' || error === null) return false;

  if (
    !('name' in error) ||
    (error as { name?: unknown }).name !== 'ValidationError'
  ) {
    return false;
  }

  if (!('errors' in error)) return false;

  const errors = (error as { errors?: unknown }).errors;
  return typeof errors === 'object' && errors !== null;
}
