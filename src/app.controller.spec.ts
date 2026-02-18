import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Test, TestingModule } from '@nestjs/testing';

import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  let appController: AppController;
  let module: TestingModule;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        AppService,
        {
          provide: CACHE_MANAGER,
          useValue: {
            get: jest.fn(),
            set: jest.fn(),
            del: jest.fn(),
          },
        },
      ],
    }).compile();

    appController = module.get<AppController>(AppController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(appController.getHello()).toBe('Hello World!');
    });
  });

  describe('test-redis', () => {
    it('should return "Redis test completed"', async () => {
      const appService = module.get<AppService>(AppService);
      jest.spyOn(appService, 'testRedis').mockResolvedValue(undefined);

      expect(await appController.testRedis()).toBe('Redis test completed');
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(appService.testRedis).toHaveBeenCalled();
    });
  });
});
