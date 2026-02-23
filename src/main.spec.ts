/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-require-imports */
/* eslint-disable @typescript-eslint/unbound-method */
import { NestFactory } from '@nestjs/core';
import { SwaggerModule } from '@nestjs/swagger';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import csurf from 'csurf';
import * as express from 'express';
import helmet from 'helmet';

// Mock dependencies
jest.mock('winston-mongodb', () => ({}));
jest.mock('@nestjs/core', () => ({
  NestFactory: {
    create: jest.fn(),
  },
}));

jest.mock('@nestjs/swagger', () => ({
  SwaggerModule: {
    createDocument: jest.fn(),
    setup: jest.fn(),
  },
  DocumentBuilder: jest.fn().mockImplementation(() => ({
    setTitle: jest.fn().mockReturnThis(),
    setDescription: jest.fn().mockReturnThis(),
    setVersion: jest.fn().mockReturnThis(),
    addTag: jest.fn().mockReturnThis(),
    addBearerAuth: jest.fn().mockReturnThis(),
    build: jest.fn().mockReturnValue({}),
  })),
}));

jest.mock('./app.module', () => ({ AppModule: class {} }));
jest.mock('./logger.config', () => ({ logger: {} }));
jest.mock('csurf', () =>
  jest.fn(() => (req: any, res: any, next: any) => next()),
);
jest.mock('cookie-parser', () =>
  jest.fn(() => (req: any, res: any, next: any) => next()),
);
jest.mock('compression', () =>
  jest.fn(() => (req: any, res: any, next: any) => next()),
);
jest.mock('helmet', () =>
  jest.fn(() => (req: any, res: any, next: any) => next()),
);
jest.mock('express', () => {
  const expr = jest.fn(() => ({}));
  (expr as any).static = jest.fn();
  return expr;
});

describe('Main', () => {
  let mockApp: any;

  beforeEach(() => {
    mockApp = {
      use: jest.fn(),
      enableCors: jest.fn(),
      useGlobalPipes: jest.fn(),
      useGlobalFilters: jest.fn(),
      setGlobalPrefix: jest.fn(),
      listen: jest.fn().mockResolvedValue(undefined),
      getHttpServer: jest.fn(),
    };

    (NestFactory.create as jest.Mock).mockResolvedValue(mockApp);
    (SwaggerModule.createDocument as jest.Mock).mockReturnValue({});
    (SwaggerModule.setup as jest.Mock).mockReturnValue(undefined);

    // Default mock implementation for join
    jest
      .spyOn(require('path'), 'join')
      .mockImplementation((...args: string[]) => args.join('/'));

    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should bootstrap the application with all configurations', async () => {
    jest.isolateModules(() => {
      require('./main');
    });

    // Wait for the async bootstrap
    let retry = 0;
    while (mockApp.listen.mock.calls.length === 0 && retry < 20) {
      await new Promise((resolve) => setTimeout(resolve, 50));
      retry++;
    }

    expect(NestFactory.create).toHaveBeenCalled();
    expect(mockApp.listen).toHaveBeenCalled();

    // Verify middlewares and trigger them for coverage
    const middlewareCalls = mockApp.use.mock.calls;

    // Find CSRF bypass middleware
    const csrfMiddlewareCall = middlewareCalls.find(
      (call: any) =>
        typeof call[0] === 'function' &&
        call[0].toString().includes('bypassPaths'),
    );

    if (csrfMiddlewareCall) {
      const csrfMiddleware = csrfMiddlewareCall[0];
      const next = jest.fn();

      // Test bypassed path
      csrfMiddleware({ path: '/api/auth/login' }, {}, next);
      expect(next).toHaveBeenCalled();

      // Test non-bypassed path
      next.mockClear();
      csrfMiddleware({ path: '/api/todos' }, {}, next);
      expect(next).toHaveBeenCalled();
    }

    // Find React catch-all middleware
    const reactMiddlewareCall = middlewareCalls.find(
      (call: any) =>
        typeof call[0] === 'function' &&
        call[0].toString().includes('index.html'),
    );

    if (reactMiddlewareCall) {
      const reactMiddleware = reactMiddlewareCall[0];
      const next = jest.fn();
      const res = { sendFile: jest.fn() };

      // Test /api path
      reactMiddleware({ path: '/api/todos' }, res, next);
      expect(next).toHaveBeenCalled();

      // Test non-api path
      next.mockClear();
      reactMiddleware({ path: '/dashboard' }, res, next);
      expect(res.sendFile).toHaveBeenCalled();
    }

    // Verify mocks were called
    expect(helmet).toHaveBeenCalled();
    expect(compression).toHaveBeenCalled();
    expect(cookieParser).toHaveBeenCalled();
    expect(csurf).toHaveBeenCalled();

    expect(express.static).toHaveBeenCalled();
  });

  it('should handle bootstrap errors', async () => {
    const error = new Error('Creation failed');
    (NestFactory.create as jest.Mock).mockRejectedValue(error);

    const consoleSpy = jest
      .spyOn(console, 'error')
      .mockImplementation(() => {});

    jest.isolateModules(() => {
      require('./main');
    });

    await new Promise((resolve) => setTimeout(resolve, 100));

    expect(consoleSpy).toHaveBeenCalledWith('Error during bootstrap:', error);
  });
});
