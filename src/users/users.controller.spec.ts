import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from '../auth/auth.controller';
import { EventsController } from '../events/events.controller';
import { UsersController } from './users.controller';

describe('UsersController', () => {
  let usersController: UsersController;
  let authController: AuthController;
  let eventsController: EventsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController, AuthController],
    }).compile();

    usersController = module.get<UsersController>(UsersController);
    authController = module.get<AuthController>(AuthController);
    eventsController = module.get<EventsController>(EventsController);
  });

  it('should be defined', () => {
    expect(usersController).toBeDefined();
  });

  it('should delete user', async () => {
    const user = await authController.register({
      email: 'test@test.com',
      name: 'tester',
      password: 'password',
    });

    const event = await eventsController.create(
      {
        description: 'My first event',
        end: new Date(),
        start: new Date(),
        title: 'First Event',
      },
      {
        user: { _id: user._id, email: user.email },
      },
    );
  });
});
