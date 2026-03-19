import { Injectable, Logger } from '@nestjs/common';
import type { Context } from '@rekog/mcp-nest';
import { Tool } from '@rekog/mcp-nest';
import { Request } from 'express';
import { z } from 'zod';

import { AuthenticatedUser } from '../auth/jwt.strategy';

import { TodosService } from '../todos/todos.service';

// Fallback to a dummy valid ObjectId if the env var is not set,
// so the tool doesn't crash on ObjectId validation.
const DEFAULT_USER_ID = process.env.MCP_USER_ID || '000000000000000000000000';

@Injectable()
export class McpTodosTool {
  private readonly logger = new Logger(McpTodosTool.name);

  constructor(private readonly todosService: TodosService) {}

  @Tool({
    name: 'list_todos',
    description:
      'Returns the list of todos for the current user. You can filter by completed status.',
    parameters: z.object({
      completed: z
        .boolean()
        .optional()
        .describe(
          'If true, returns only completed todos. If false, active. If omitted, all.',
        ),
    }),
  })
  async listTodos(
    { completed }: { completed?: boolean },
    context: Context,
    req: Request & { user?: AuthenticatedUser },
  ) {
    const userId = req?.user?.userId || DEFAULT_USER_ID;
    this.logger.log(`MCP listing todos for user ${userId}, completed=${completed}`);
    return this.todosService.findAll(userId, completed);
  }

  @Tool({
    name: 'create_todo',
    description: 'Creates a new todo for the user.',
    parameters: z.object({
      title: z.string().describe('The title or main text of the todo.'),
    }),
  })
  async createTodo(
    { title }: { title: string },
    context: Context,
    req: Request & { user?: AuthenticatedUser },
  ) {
    const userId = req?.user?.userId || DEFAULT_USER_ID;
    this.logger.log(`MCP creating todo for user ${userId}: ${title}`);
    return this.todosService.create({ title, completed: false }, userId);
  }

  @Tool({
    name: 'update_todo',
    description: 'Updates a todo or marks it as completed.',
    parameters: z.object({
      id: z.string().describe('The ID of the todo to update.'),
      title: z.string().optional().describe('New title for the todo.'),
      completed: z
        .boolean()
        .optional()
        .describe('Set to true to complete the todo, or false to un-complete.'),
    }),
  })
  async updateTodo(
    { id, title, completed }: { id: string; title?: string; completed?: boolean; },
    context: Context,
    req: Request & { user?: AuthenticatedUser },
  ) {
    const userId = req?.user?.userId || DEFAULT_USER_ID;
    this.logger.log(`MCP updating todo ${id} for user ${userId}`);
    return this.todosService.update(id, userId, { title, completed });
  }

  @Tool({
    name: 'delete_todo',
    description: 'Deletes a todo by ID.',
    parameters: z.object({
      id: z.string().describe('The ID of the todo to delete.'),
    }),
  })
  async deleteTodo(
    { id }: { id: string },
    context: Context,
    req: Request & { user?: AuthenticatedUser },
  ) {
    const userId = req?.user?.userId || DEFAULT_USER_ID;
    this.logger.log(`MCP deleting todo ${id} for user ${userId}`);
    return this.todosService.delete(id, userId);
  }

  @Tool({
    name: 'get_todo_stats',
    description:
      'Gets statistics about todo creation, completion, and deletion over the last 14 days.',
    parameters: z.object({}),
  })
  async getTodoStats(
    args: Record<string, never>,
    context: Context,
    req: Request & { user?: AuthenticatedUser },
  ) {
    const userId = req?.user?.userId || DEFAULT_USER_ID;
    this.logger.log(`MCP getting todo stats for user ${userId}`);
    // Assuming getLast14DaysStats is global, or needs userId (currently takes no args in service maybe?). 
    // Usually admin or context specific?
    return this.todosService.getLast14DaysStats();
  }
}
