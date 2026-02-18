import KeyvRedis from '@keyv/redis';
import { CacheModule } from '@nestjs/cache-manager';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CacheableMemory } from 'cacheable';
import { Keyv } from 'keyv';

import { AdminModule } from './admin/admin.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { StreamModule } from './stream/stream.module';
import { TodosModule } from './todos/todos.module';

@Module({
  imports: [
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
    TodosModule,
    AuthModule,
    AdminModule,
    StreamModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
