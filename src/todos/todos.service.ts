import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types, isValidObjectId, FilterQuery } from 'mongoose';
import { Todo, TodoDocument } from './schemas/todo.schema';
import { CreateTodoDto } from './dto/create-todo.dto';

@Injectable()
export class TodosService {
  private readonly logger = new Logger(TodosService.name);

  constructor(
    @InjectModel(Todo.name)
    private readonly todoModel: Model<TodoDocument>,
  ) {}

  async findAll(userId: string, completed?: boolean): Promise<Todo[]> {
    if (!isValidObjectId(userId)) {
      throw new BadRequestException('Invalid userId format');
    }

    const filter: FilterQuery<TodoDocument> = {
      userId: new Types.ObjectId(userId),
      deleted: false,
    };

    if (completed === true) filter.completed = true;
    if (completed === false) filter.completed = false;

    this.logger.log(`Todos requested by ${userId}`, { userId });

    return this.todoModel.find(filter).exec();
  }

  async findOne(id: string, userId: string): Promise<Todo> {
    if (!isValidObjectId(id) || !isValidObjectId(userId)) {
      throw new BadRequestException('Invalid id format');
    }

    const todo = await this.todoModel.findOne({
      _id: new Types.ObjectId(id),
      userId: new Types.ObjectId(userId),
    });

    if (!todo) {
      throw new NotFoundException(`Todo with id "${id}" not found`);
    }

    return todo;
  }

  async create(createDto: CreateTodoDto, userId: string): Promise<Todo> {
    if (!isValidObjectId(userId)) {
      throw new BadRequestException('Invalid userId format');
    }

    const newTodo = new this.todoModel({
      ...createDto,
      userId: new Types.ObjectId(userId),
    });

    this.logger.log(`Todo created by ${userId} with title "${newTodo.title}"`, {
      userId,
    });

    return newTodo.save();
  }

  async update(
    id: string,
    userId: string,
    todoUpdate: Partial<CreateTodoDto>,
  ): Promise<Todo> {
    if (!isValidObjectId(id) || !isValidObjectId(userId)) {
      throw new BadRequestException('Invalid id format');
    }

    const updated = await this.todoModel
      .findOneAndUpdate(
        {
          _id: new Types.ObjectId(id),
          userId: new Types.ObjectId(userId),
        },
        todoUpdate,
        { new: true },
      )
      .exec();

    if (!updated) {
      throw new NotFoundException(`Todo with id "${id}" not found`);
    }

    return updated;
  }

  async delete(id: string, userId: string): Promise<Todo> {
    if (!isValidObjectId(id) || !isValidObjectId(userId)) {
      throw new BadRequestException('Invalid id format');
    }

    const deleted = await this.todoModel
      .findOneAndUpdate(
        {
          _id: new Types.ObjectId(id),
          userId: new Types.ObjectId(userId),
        },
        { deleted: true },
        { new: true },
      )
      .exec();

    if (!deleted) {
      throw new NotFoundException(`Todo with id "${id}" not found`);
    }

    return deleted;
  }

  async deleteTodosByUser(userId: string): Promise<{ deletedCount: number }> {
    if (!isValidObjectId(userId)) {
      throw new BadRequestException('Invalid userId format');
    }

    const result = await this.todoModel.updateMany(
      {
        userId: new Types.ObjectId(userId),
        deleted: false,
      },
      { deleted: true },
    );

    return { deletedCount: result.modifiedCount };
  }

  async countTodosByUser(userId: string | Types.ObjectId): Promise<number> {
    const id = typeof userId === 'string' ? new Types.ObjectId(userId) : userId;

    return this.todoModel.countDocuments({ userId: id, deleted: false }).exec();
  }
}
