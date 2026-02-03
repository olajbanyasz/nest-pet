import { Injectable, Inject, Logger } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';

@Injectable()
export class AppService {
  private readonly logger = new Logger(AppService.name);

  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  getHello(): string {
    return 'Hello World!';
  }

  async testRedis(): Promise<void> {
    await this.cacheManager.set('test_key', 'hello');
    const value = await this.cacheManager.get('test_key');
    console.log('value', value);
    this.logger.log(`REDIS TEST VALUE: ${String(value)}`);
  }
}
