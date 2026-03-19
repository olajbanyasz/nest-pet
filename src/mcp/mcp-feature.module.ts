import { Module } from '@nestjs/common';
import { McpModule } from '@rekog/mcp-nest';

import { TodosModule } from '../todos/todos.module';
import { McpTodosTool } from './mcp-todos.tool';

@Module({
  imports: [
    TodosModule,
    McpModule.forFeature([McpTodosTool], 'todo-mcp-server'),
  ],
  providers: [McpTodosTool],
})
export class McpFeatureModule {}
