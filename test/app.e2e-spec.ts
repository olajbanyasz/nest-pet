import { INestApplication, ValidationPipe } from '@nestjs/common';
import { getConnectionToken, getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import cookieParser from 'cookie-parser';
import csurf from 'csurf';
import { NextFunction, Request, Response } from 'express';
import { Connection, Model } from 'mongoose';
import request from 'supertest';
import { User, UserDocument, UserRole } from '../src/users/schemas/user.schema';
import { Todo, TodoDocument } from '../src/todos/schemas/todo.schema';
import { AppModule } from './../src/app.module';

describe('App (e2e)', () => {
  let app: INestApplication;
  let agent: any;
  let csrfToken: string;
  let userModel: Model<UserDocument>;
  let todoModel: Model<TodoDocument>;

  const testUser = {
    email: `test-${Date.now()}@example.com`,
    password: 'Password123!',
    name: 'Test Admin User',
  };

  const secondTestUser = {
    email: `test-second-${Date.now()}@example.com`,
    password: 'Password123!',
    name: 'Test Target User',
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    userModel = app.get<Model<UserDocument>>(getModelToken(User.name));
    todoModel = app.get<Model<TodoDocument>>(getModelToken(Todo.name));

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
    // Find test users to get their IDs for todo cleanup
    const testUsers = await userModel.find({
      email: { $in: [testUser.email, secondTestUser.email] },
    });
    const userIds = testUsers.map((u) => u._id);

    // Clean up test todos
    await todoModel.deleteMany({
      userId: { $in: userIds },
    });

    // Clean up test users
    await userModel.deleteMany({
      _id: { $in: userIds },
    });

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
        .expect(async (res: any) => {
          expect(res.body.message).toBe('Registration and login successful');
          expect(res.body.user.email).toBe(testUser.email);

          // Make testUser an ADMIN in database so we can test admin endpoints later
          await userModel.updateOne(
            { email: testUser.email },
            { role: UserRole.ADMIN },
          );
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
          expect(res.body.role).toBe(UserRole.ADMIN);
        });
    });

    it('/auth/logout (POST)', async () => {
      await agent.post('/api/auth/logout')
        .expect(201)
        .expect((res: any) => {
          expect(res.body.message).toBe('Logout successful');
        });

      // Verify that after logout, /me returns 401
      await agent.get('/api/auth/me').expect(401);

      // Log back in to continue other tests that require auth
      await agent
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password,
        })
        .expect(201);

      // Refresh CSRF token for subsequent tests
      const res = await agent.get('/api/auth/csrf-token').expect(200);
      csrfToken = res.body.csrfToken;
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

  describe('AdminModule', () => {
    let secondUserId: string;

    it('should register a second user for admin testing', async () => {
      const res = await agent
        .post('/api/auth/register')
        .send(secondTestUser)
        .expect(201);

      secondUserId = res.body.user.id;

      // Re-login as original testUser (Admin) because register logs in as new user
      await agent
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password,
        })
        .expect(201);

      // Refresh CSRF token for Admin user
      const csrfRes = await agent.get('/api/auth/csrf-token').expect(200);
      csrfToken = csrfRes.body.csrfToken;
    });

    it('/admin/users/:id/promote (PATCH)', () => {
      return agent
        .patch(`/api/admin/users/${secondUserId}/promote`)
        .set('x-csrf-token', csrfToken)
        .expect(200)
        .expect((res: any) => {
          expect(res.body.role).toBe(UserRole.ADMIN);
        });
    });

    it('/admin/users/:id/demote (PATCH)', () => {
      return agent
        .patch(`/api/admin/users/${secondUserId}/demote`)
        .set('x-csrf-token', csrfToken)
        .expect(200)
        .expect((res: any) => {
          expect(res.body.role).toBe(UserRole.USER);
        });
    });

    it('/admin/users/:id (DELETE)', () => {
      return agent
        .delete(`/api/admin/users/${secondUserId}`)
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
