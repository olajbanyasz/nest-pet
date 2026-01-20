import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, isValidObjectId } from 'mongoose';
import { Todo, TodoDocument } from './schemas/todo.schema';
import { CreateTodoDto } from './dto/create-todo.dto';
import { Logger } from '@nestjs/common';

@Injectable()
export class TodosService {
  private readonly logger = new Logger(TodosService.name);
  constructor(@InjectModel(Todo.name) private todoModel: Model<TodoDocument>) {}

  async findAll(userId: string, completed?: boolean): Promise<Todo[]> {
    const filter: Partial<Todo> & { deleted: boolean } = {
      userId,
      deleted: false,
    };
    if (completed === true) filter.completed = true;
    if (completed === false) filter.completed = false;
    this.logger.log(`Todos asked by ${userId}`, {
      userId,
    });
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

    this.logger.log(`Todo ${id} asked by ${userId}`, {
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
      this.logger.log(`Todo created by ${userId} with name ${newTodo.title}`, {
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
    this.logger.log(
      `Todo is updated by ${userId} with title: ${todoUpdate.title}, completed: ${todoUpdate.completed}, deleted: ${todoUpdate.deleted}`,
      {
        userId,
      },
    );
    return updated;
  }

  async delete(id: string, userId: string): Promise<Todo> {
    if (!isValidObjectId(id)) {
      throw new BadRequestException('Invalid id format');
    }
    const deleted = await this.todoModel
      .findOneAndUpdate({ _id: id, userId }, { deleted: true }, { new: true })
      .exec();
    if (!deleted) {
      throw new NotFoundException(`Todo with id "${id}" not found`);
    }
    this.logger.log(`Todo ${id} is deleted by ${userId}.`, {
      userId,
    });
    return deleted;
  }

  async deleteTodosByUser(userId: string): Promise<{ deletedCount: number }> {
    const result = await this.todoModel
      .updateMany({ userId, deleted: false }, { deleted: true })
      .exec();

    this.logger.log(`Deleted todos for user ${userId}`, { userId });

    return { deletedCount: result.modifiedCount };
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
