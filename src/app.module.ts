import KeyvRedis from '@keyv/redis';
import { CacheModule } from '@nestjs/cache-manager';
import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { MongooseModule } from '@nestjs/mongoose';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { CacheableMemory } from 'cacheable';
import { Keyv } from 'keyv';

import { AdminModule } from './admin/admin.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { AutomationModule } from './automation/automation.module';
import { EventsModule } from './events/events.module';
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
