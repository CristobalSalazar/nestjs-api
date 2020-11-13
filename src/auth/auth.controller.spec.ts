import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';

describe('AuthController', () => {
  let controller: AuthController;
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
    }).compile();
    controller = module.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should register user', () => {
    try {
      const result = await controller.register({
        email: 'test@test.com',
        password: 'password',
        name: 'test',
      });
      expect(result).toBeDefined();
    } catch (err) {
      fail(err);
    }
  });
});
