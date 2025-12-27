import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import type { App } from 'supertest/types';
import { getConnectionToken } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { AppModule } from '../src/app.module';
import type {
  OrderResponseDto,
  ListOrdersResponseDto,
} from '../src/application/dtos/order.dtos';
import type {
  LoginResponseDto,
  RegisterResponseDto,
} from '../src/application/dtos/auth.dtos';

describe('OrdersController (e2e)', () => {
  let app: INestApplication;
  let authToken: string;

  const getServer = (): App => app.getHttpServer() as App;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    await app.init();

    // Clean database before tests
    const connection = app.get<Connection>(getConnectionToken());
    await connection.dropDatabase();

    // Register and login a test user to get auth token
    const registerResponse = await request(getServer())
      .post('/api/auth/register')
      .send({
        email: 'test@example.com',
        password: 'password123',
      })
      .expect(201);

    const registerBody = registerResponse.body as RegisterResponseDto;
    expect(registerBody.token).toBeTruthy();
    expect(registerBody.user.email).toBe('test@example.com');

    const loginResponse = await request(getServer())
      .post('/api/auth/login')
      .send({
        email: 'test@example.com',
        password: 'password123',
      })
      .expect(200);

    const loginBody = loginResponse.body as LoginResponseDto;
    expect(loginBody.token).toBeTruthy();
    authToken = loginBody.token;
  });

  afterAll(async () => {
    await app.close();
  });

  it('/api/orders (POST) - should create a new order', () => {
    return request(getServer())
      .post('/api/orders')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        lab: 'Test Lab',
        patient: 'Test Patient',
        customer: 'Test Customer',
        services: [
          {
            name: 'Service 1',
            value: 100,
            status: 'PENDING',
          },
        ],
      })
      .expect(201)
      .expect((res) => {
        const body = res.body as OrderResponseDto;
        expect(body.lab).toBe('Test Lab');
        expect(body.patient).toBe('Test Patient');
        expect(body.customer).toBe('Test Customer');
        expect(body.state).toBe('CREATED');
        expect(body.status).toBe('ACTIVE');
        expect(body.services).toHaveLength(1);
        expect(body.services[0].name).toBe('Service 1');
        expect(body.services[0].value).toBe(100);
        expect(body.services[0].status).toBe('PENDING');
      });
  });

  it('/api/orders (GET) - should list orders', () => {
    return request(getServer())
      .get('/api/orders')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200)
      .expect((res) => {
        const body = res.body as ListOrdersResponseDto;
        expect(body).toHaveProperty('orders');
        expect(body).toHaveProperty('total');
        expect(body).toHaveProperty('page');
        expect(body).toHaveProperty('totalPages');
        expect(Array.isArray(body.orders)).toBe(true);
      });
  });

  it('/api/orders/:id/advance (PATCH) - should advance order state', async () => {
    // First create an order
    const createResponse = await request(getServer())
      .post('/api/orders')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        lab: 'Test Lab 2',
        patient: 'Test Patient 2',
        customer: 'Test Customer 2',
        services: [
          {
            name: 'Service 2',
            value: 200,
            status: 'PENDING',
          },
        ],
      })
      .expect(201);

    const createBody = createResponse.body as OrderResponseDto;
    const orderId = createBody.id;

    // Then advance the order state
    return request(getServer())
      .patch(`/api/orders/${orderId}/advance`)
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200)
      .expect((res) => {
        const body = res.body as OrderResponseDto;
        expect(body.id).toBe(orderId);
        expect(body.state).toBe('ANALYSIS');
      });
  });

  it('/api/orders/:id/advance (PATCH) - should not skip from CREATED to COMPLETED', async () => {
    const createResponse = await request(getServer())
      .post('/api/orders')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        lab: 'Test Lab 4',
        patient: 'Test Patient 4',
        customer: 'Test Customer 4',
        services: [
          {
            name: 'Service 4',
            value: 150,
            status: 'PENDING',
          },
        ],
      })
      .expect(201);

    const createBody = createResponse.body as OrderResponseDto;
    const orderId = createBody.id;

    return request(getServer())
      .patch(`/api/orders/${orderId}/advance`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({ state: 'COMPLETED' })
      .expect(200)
      .expect((res) => {
        const body = res.body as OrderResponseDto;
        expect(body.state).toBe('ANALYSIS');
      });
  });

  it('/api/orders/:id/advance (PATCH) - should not allow invalid state transition', async () => {
    // First create an order
    const createResponse = await request(getServer())
      .post('/api/orders')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        lab: 'Test Lab 3',
        patient: 'Test Patient 3',
        customer: 'Test Customer 3',
        services: [
          {
            name: 'Service 3',
            value: 300,
            status: 'PENDING',
          },
        ],
      })
      .expect(201);

    const createBody = createResponse.body as OrderResponseDto;
    const orderId = createBody.id;

    // Advance to ANALYSIS
    await request(getServer())
      .patch(`/api/orders/${orderId}/advance`)
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);

    // Advance to COMPLETED
    await request(getServer())
      .patch(`/api/orders/${orderId}/advance`)
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);

    // Try to advance again (should fail)
    return request(getServer())
      .patch(`/api/orders/${orderId}/advance`)
      .set('Authorization', `Bearer ${authToken}`)
      .expect(400);
  });
});
