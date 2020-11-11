import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('Should delete all events assosciated with user when user is deleted', async () => {
    const email = 'test@test.com';
    const password = 'password';

    const server = app.getHttpServer();
    const { body: user } = await request(server)
      .post('/auth/register')
      .set('Accept', 'application/json')
      .send({
        email,
        password,
        name: 'test',
      })
      .expect(201);

    const {
      body: { token },
    } = await request(server)
      .post('/auth/login')
      .set('Accept', 'application/json')
      .send({ email, password })
      .expect(201);

    const event = await request(server)
      .post('/events')
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'My First Event',
        description: 'This is my first event',
        start: new Date(),
        end: new Date(),
      })
      .expect(201);

    await request(server)
      .del(`/users/${user._id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    const { body: events } = await request(server)
      .get('/events')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(events).toHaveLength(0);
  });
});
