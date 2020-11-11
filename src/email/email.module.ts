import { Module } from '@nestjs/common';
import { EmailController } from './email.controller';
import { EmailService } from './email.service';
import { EmailVerificationService } from './email-verification/email-verification.service';

@Module({
  providers: [EmailService, EmailVerificationService],
  controllers: [EmailController],
  exports: [EmailService],
})
export class EmailModule {}
