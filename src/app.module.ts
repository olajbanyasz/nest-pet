/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CacheModule, CacheModuleOptions } from '@nestjs/cache-manager';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TodosModule } from './todos/todos.module';
import { AuthModule } from './auth/auth.module';
import { AdminModule } from './admin/admin.module';
import KeyvRedis from '@keyv/redis';
import { Keyv } from 'keyv';
import { CacheableMemory } from 'cacheable';

@Module({
  imports: [
    CacheModule.register({
      isGlobal: true,
      store: (() => {
        const memoryStore = new Keyv({
          store: new CacheableMemory({ ttl: 60000, lruSize: 5000 }),
        });
        const redisStore = new KeyvRedis('redis://127.0.0.1:6379');
        return [memoryStore, redisStore];
      })() as unknown as CacheModuleOptions['store'],
    }),
    MongooseModule.forRoot(
      process.env.MONGODB_URI || 'mongodb://localhost:27017/nest-pet',
    ),
    TodosModule,
    AuthModule,
    AdminModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
