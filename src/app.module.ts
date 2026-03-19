import KeyvRedis from '@keyv/redis';
import { CacheModule } from '@nestjs/cache-manager';
import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { MongooseModule } from '@nestjs/mongoose';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { McpModule } from '@rekog/mcp-nest';
import { CacheableMemory } from 'cacheable';
import { Keyv } from 'keyv';

import { AdminModule } from './admin/admin.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { AutomationModule } from './automation/automation.module';
import { EventsModule } from './events/events.module';
import { LogArchiveModule } from './log-archive/log-archive.module';
import { McpFeatureModule } from './mcp/mcp-feature.module';
import { StreamModule } from './stream/stream.module';
import { TodosModule } from './todos/todos.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    ThrottlerModule.forRoot([
      {
        ttl: 60_000,
        limit: 120,
      },
    ]),
    CacheModule.register({
      isGlobal: true,
      stores: [
        new Keyv({
          store: new CacheableMemory({ ttl: 60, lruSize: 5000 }),
        }),
        new KeyvRedis('redis://localhost:6379'),
      ],
    }),
    MongooseModule.forRoot(
      process.env.MONGODB_URI || 'mongodb://localhost:27017/nest-pet',
    ),
    EventsModule,
    TodosModule,
    AuthModule,
    AdminModule,
    AutomationModule,
    StreamModule,
    LogArchiveModule,
    McpModule.forRoot({
      name: 'todo-mcp-server',
      version: '1.0.0',
      guards: [JwtAuthGuard],
    }),
    McpFeatureModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
