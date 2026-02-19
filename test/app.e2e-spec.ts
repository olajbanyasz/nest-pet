import { INestApplication, ValidationPipe } from '@nestjs/common';
import { getConnectionToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import cookieParser from 'cookie-parser';
import csurf from 'csurf';
import { NextFunction, Request, Response } from 'express';
import { Connection } from 'mongoose';
import request from 'supertest';

import { AppModule } from './../src/app.module';

describe('App (e2e)', () => {
  let app: INestApplication;
  let agent: any;
  let csrfToken: string;

  const testUser = {
    email: `test-${Date.now()}@example.com`,
    password: 'Password123!',
    name: 'Test User',
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    // Replicate main.ts setup
    app.use(cookieParser());
    app.setGlobalPrefix('api');

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

    await app.init();
    agent = request.agent(app.getHttpServer());
  });

  afterAll(async () => {
    const connection = app.get<Connection>(getConnectionToken());
    await connection.close();
    await app.close();
  });

  describe('AuthModule', () => {
    it('/auth/register (POST)', () => {
      return agent
        .post('/api/auth/register')
        .send(testUser)
        .expect(201)
        .expect((res: any) => {
          expect(res.body.message).toBe('Registration and login successful');
          expect(res.body.user.email).toBe(testUser.email);
        });
    });

    it('/auth/login (POST)', () => {
      return agent
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password,
        })
        .expect(201)
        .expect((res: any) => {
          expect(res.body.message).toBe('Login successful');
          expect(res.body.access_token).toBeDefined();
        });
    });

    it('/auth/csrf-token (GET)', async () => {
      const res = await agent.get('/api/auth/csrf-token').expect(200);

      expect(res.body.csrfToken).toBeDefined();
      csrfToken = res.body.csrfToken as string;
    });

    it('/auth/me (GET)', () => {
      return agent
        .get('/api/auth/me')
        .expect(200)
        .expect((res: any) => {
          expect(res.body.email).toBe(testUser.email);
        });
    });
  });

  describe('TodosModule', () => {
    let todoId: string;

    it('/todos (POST)', () => {
      return agent
        .post('/api/todos')
        .set('x-csrf-token', csrfToken)
        .send({
          title: 'Test Todo',
        })
        .expect(201)
        .expect((res: any) => {
          expect(res.body.title).toBe('Test Todo');
          expect(res.body._id).toBeDefined();
          todoId = res.body._id as string;
        });
    });

    it('/todos (GET)', () => {
      return agent
        .get('/api/todos')
        .expect(200)
        .expect((res: any) => {
          expect(Array.isArray(res.body)).toBe(true);
          expect(res.body.length).toBeGreaterThan(0);
        });
    });

    it('/todos/:id (PATCH)', () => {
      return agent
        .patch(`/api/todos/${todoId}`)
        .set('x-csrf-token', csrfToken)
        .send({
          completed: true,
        })
        .expect(200)
        .expect((res: any) => {
          expect(res.body.completed).toBe(true);
        });
    });

    it('/todos/:id (DELETE)', () => {
      return agent
        .delete(`/api/todos/${todoId}`)
        .set('x-csrf-token', csrfToken)
        .expect(200);
    });
  });

  it('/api (GET)', () => {
    return agent
      .get('/api/api')
      .expect(200)
      .expect('Hello World!');
  });
});
