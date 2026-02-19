import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, isValidObjectId, Model, Types } from 'mongoose';

import { CreateTodoDto } from './dto/create-todo.dto';
import { UpdateTodoDto } from './dto/update-todo.dto';
import { Todo, TodoDocument } from './schemas/todo.schema';

interface DailyStat {
  _id: string;
  count: number;
}

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
    todoUpdate: Partial<UpdateTodoDto>,
  ): Promise<Todo> {
    if (!isValidObjectId(id) || !isValidObjectId(userId)) {
      throw new BadRequestException('Invalid id format');
    }

    const existing = await this.todoModel.findOne({
      _id: new Types.ObjectId(id),
      userId: new Types.ObjectId(userId),
    });

    if (!existing) {
      throw new NotFoundException(`Todo with id "${id}" not found`);
    }

    if (typeof todoUpdate.completed === 'boolean') {
      if (todoUpdate.completed && !existing.completed) {
        todoUpdate.completedAt = new Date();
      }

      if (!todoUpdate.completed && existing.completed) {
        todoUpdate.completedAt = null;
      }
    }

    const updated = await this.todoModel
      .findOneAndUpdate(
        {
          _id: existing._id,
          userId: existing.userId,
        },
        todoUpdate,
        { new: true },
      )
      .exec();

    return updated!;
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

  async countAllTodos(): Promise<number> {
    return this.todoModel.countDocuments().exec();
  }

  async countCompletedTodos(): Promise<number> {
    return this.todoModel
      .countDocuments({ completed: true, deleted: false })
      .exec();
  }

  async countActiveTodos(): Promise<number> {
    return this.todoModel
      .countDocuments({ completed: false, deleted: false })
      .exec();
  }

  async countDeletedTodos(): Promise<number> {
    return this.todoModel.countDocuments({ deleted: true }).exec();
  }

  async getLast14DaysStats(): Promise<{
    createdTodos: Record<string, number>;
    completedTodos: Record<string, number>;
    deletedTodos: Record<string, number>;
  }> {
    const today = new Date();
    const endDate = new Date(
      Date.UTC(
        today.getUTCFullYear(),
        today.getUTCMonth(),
        today.getUTCDate(),
        23,
        59,
        59,
        999,
      ),
    );

    const startDate = new Date(endDate);
    startDate.setUTCDate(startDate.getUTCDate() - 13);
    startDate.setUTCHours(0, 0, 0, 0);

    const createdResult = await this.todoModel.aggregate<DailyStat>([
      {
        $match: {
          createdAt: {
            $gte: startDate,
            $lte: today,
          },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: '%Y-%m-%d',
              date: '$createdAt',
              timezone: 'UTC',
            },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const completedResult = await this.todoModel.aggregate<DailyStat>([
      {
        $match: {
          completed: true,
          completedAt: {
            $gte: startDate,
            $lte: today,
          },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: '%Y-%m-%d',
              date: '$completedAt',
              timezone: 'UTC',
            },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const deletedResult = await this.todoModel.aggregate<DailyStat>([
      {
        $match: {
          deleted: true,
          updatedAt: {
            $gte: startDate,
            $lte: today,
          },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: '%Y-%m-%d',
              date: '$updatedAt',
              timezone: 'UTC',
            },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const createdDays: Record<string, number> = {};
    const completedDays: Record<string, number> = {};
    const deletedDays: Record<string, number> = {};

    for (let i = 0; i < 14; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      const key = date.toISOString().split('T')[0];

      if (key) {
        createdDays[key] = 0;
        completedDays[key] = 0;
        deletedDays[key] = 0;
      }
    }

    createdResult.forEach((item) => {
      createdDays[item._id] = item.count;
    });

    completedResult.forEach((item) => {
      completedDays[item._id] = item.count;
    });

    deletedResult.forEach((item) => {
      deletedDays[item._id] = item.count;
    });

    return {
      createdTodos: createdDays,
      completedTodos: completedDays,
      deletedTodos: deletedDays,
    };
  }
}
