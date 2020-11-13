import { VerifiedEmailGuard } from './verified-email.guard';

describe('VerifiedEmailGuard', () => {
  it('should be defined', () => {
    expect(new VerifiedEmailGuard()).toBeDefined();
  });
});
