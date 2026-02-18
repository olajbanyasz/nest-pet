/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import { join } from 'path';
import * as express from 'express';
import { AppModule } from './app.module';
import { logger } from './logger.config';
import { AllExceptionsFilter } from './common/filters/http-exception.filter';
import csurf from 'csurf';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    abortOnError: false,
    logger,
  });

  app.enableCors({
    origin: 'http://localhost:8000',
    credentials: true,
  });

  app.use(cookieParser());

  const csrfMiddleware = csurf({
    cookie: {
      httpOnly: true,
      sameSite: 'lax',
    },
  });

  app.use((req, res, next) => {
    const bypassPaths = [
      '/api/auth/login',
      '/api/auth/register',
      '/api/auth/refresh',
      '/api/auth/logout',
    ];

    const isBypassed = bypassPaths.some((path) => req.path.startsWith(path));

    if (isBypassed) {
      return next();
    }

    return csrfMiddleware(req, res, next);
  });

  app.useGlobalPipes(new ValidationPipe());
  app.useGlobalFilters(new AllExceptionsFilter());
  app.setGlobalPrefix('api');

  const clientBuildPath = join(__dirname, '..', 'client', 'build');
  app.use(express.static(clientBuildPath));

  app.use((req, res, next) => {
    if (req.path.startsWith('/api')) {
      return next();
    }
    res.sendFile(join(clientBuildPath, 'index.html'));
  });

  await app.listen(process.env.PORT ?? 3000);
}

bootstrap();
