import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';

describe('OrdersController (e2e)', () => {
  let app: INestApplication;
  let authToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    // Register and login a test user to get auth token
    await request(app.getHttpServer())
      .post('/api/auth/register')
      .send({
        email: 'test@example.com',
        password: 'password123',
      })
      .expect(201);

    const loginResponse = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({
        email: 'test@example.com',
        password: 'password123',
      })
      .expect(200);

    authToken = loginResponse.body.token;
  });

  afterAll(async () => {
    await app.close();
  });

  it('/api/orders (POST) - should create a new order', () => {
    return request(app.getHttpServer())
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
        expect(res.body.lab).toBe('Test Lab');
        expect(res.body.patient).toBe('Test Patient');
        expect(res.body.customer).toBe('Test Customer');
        expect(res.body.state).toBe('CREATED');
        expect(res.body.status).toBe('ACTIVE');
        expect(res.body.services).toHaveLength(1);
        expect(res.body.services[0].name).toBe('Service 1');
        expect(res.body.services[0].value).toBe(100);
        expect(res.body.services[0].status).toBe('PENDING');
      });
  });

  it('/api/orders (GET) - should list orders', () => {
    return request(app.getHttpServer())
      .get('/api/orders')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200)
      .expect((res) => {
        expect(res.body).toHaveProperty('orders');
        expect(res.body).toHaveProperty('total');
        expect(res.body).toHaveProperty('page');
        expect(res.body).toHaveProperty('totalPages');
        expect(Array.isArray(res.body.orders)).toBe(true);
      });
  });

  it('/api/orders/:id/advance (PATCH) - should advance order state', async () => {
    // First create an order
    const createResponse = await request(app.getHttpServer())
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

    const orderId = createResponse.body.id;

    // Then advance the order state
    return request(app.getHttpServer())
      .patch(`/api/orders/${orderId}/advance`)
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200)
      .expect((res) => {
        expect(res.body.id).toBe(orderId);
        expect(res.body.state).toBe('ANALYSIS');
      });
  });

  it('/api/orders/:id/advance (PATCH) - should not allow invalid state transition', async () => {
    // First create an order
    const createResponse = await request(app.getHttpServer())
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

    const orderId = createResponse.body.id;

    // Advance to ANALYSIS
    await request(app.getHttpServer())
      .patch(`/api/orders/${orderId}/advance`)
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);

    // Advance to COMPLETED
    await request(app.getHttpServer())
      .patch(`/api/orders/${orderId}/advance`)
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);

    // Try to advance again (should fail)
    return request(app.getHttpServer())
      .patch(`/api/orders/${orderId}/advance`)
      .set('Authorization', `Bearer ${authToken}`)
      .expect(400);
  });
});