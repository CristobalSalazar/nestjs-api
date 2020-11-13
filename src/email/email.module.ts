import { Module } from '@nestjs/common';
import { EmailService } from './email.service';
import { EmailClientFactory } from './email.client';

@Module({
  providers: [EmailService, EmailClientFactory],
  exports: [EmailService],
})
export class EmailModule {}
