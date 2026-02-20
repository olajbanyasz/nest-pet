import { CacheModule } from '@nestjs/cache-manager';
import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';

import { Todo } from '../todos/schemas/todo.schema';
import { TodosService } from '../todos/todos.service';
import { User } from '../users/schemas/user.schema';
import { AdminController } from './admin.controller';
import { AdminModule } from './admin.module';
import { AdminService } from './admin.service';

describe('AdminModule', () => {
  let module: TestingModule;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [
        CacheModule.register({ isGlobal: true }), // Make it global so AdminModule sees it
        AdminModule,
      ],
    })
      .overrideProvider(AdminService)
      .useValue({})
      .overrideProvider(AdminController)
      .useValue({})
      .overrideProvider(getModelToken(User.name))
      .useValue({})
      .overrideProvider(getModelToken(Todo.name))
      .useValue({})
      .overrideProvider(TodosService)
      .useValue({})
      .compile();
  });

  it('should be defined', () => {
    expect(module).toBeDefined();
  });

  it('should provide AdminService (overridden)', () => {
    const service = module.get<AdminService>(AdminService);
    expect(service).toBeDefined();
  });
});
