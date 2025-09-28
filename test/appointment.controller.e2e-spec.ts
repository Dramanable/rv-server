import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, HttpStatus } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('AppointmentController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /appointments/available-slots', () => {
    it('should require authentication', async () => {
      return request(app.getHttpServer())
        .post('/appointments/available-slots')
        .send({})
        .expect(HttpStatus.UNAUTHORIZED);
    });
  });

  describe('POST /appointments', () => {
    it('should require authentication', async () => {
      return request(app.getHttpServer())
        .post('/appointments')
        .send({})
        .expect(HttpStatus.UNAUTHORIZED);
    });
  });

  describe('GET /appointments/:id', () => {
    it('should require authentication', async () => {
      return request(app.getHttpServer())
        .get('/appointments/test-id')
        .expect(HttpStatus.UNAUTHORIZED);
    });
  });
});
