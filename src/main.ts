import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import csurf from 'csurf';
import * as express from 'express';
import { NextFunction, Request, Response } from 'express';
import helmet from 'helmet';
import { join } from 'path';

import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/http-exception.filter';
import { logger } from './logger.config';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    abortOnError: false,
    logger,
  });

  app.use(
    helmet({
      contentSecurityPolicy: false,
    }),
  );
  app.use(compression());
  app.use(cookieParser());

  app.enableCors({
    origin: 'http://localhost:8000',
    credentials: true,
  });

  const csrfMiddleware = csurf({
    cookie: {
      httpOnly: true,
      sameSite: 'lax',
    },
  });

  app.use((req: Request, res: Response, next: NextFunction) => {
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

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  app.useGlobalFilters(new AllExceptionsFilter());
  app.setGlobalPrefix('api');

  // Swagger Configuration
  const config = new DocumentBuilder()
    .setTitle('Todo Pet Project API')
    .setDescription('The Todo Pet Project API description')
    .setVersion('1.0')
    .addTag('auth')
    .addTag('todos')
    .addTag('admin')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const clientBuildPath = join(__dirname, '..', 'client', 'build');
  app.use(express.static(clientBuildPath));

  app.use((req: Request, res: Response, next: NextFunction) => {
    if (req.path.startsWith('/api')) {
      return next();
    }
    res.sendFile(join(clientBuildPath, 'index.html'));
  });

  await app.listen(process.env.PORT ?? 3000);
}

bootstrap().catch((err: unknown) => {
  console.error('Error during bootstrap:', err);
});
