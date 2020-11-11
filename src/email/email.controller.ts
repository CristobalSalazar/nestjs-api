import { Controller, Get, Param, Post } from '@nestjs/common';
import { EmailService } from './email.service';

@Controller('email')
export class EmailController {
  constructor(private readonly emailService: EmailService) {}

  @Get('password-reset/:uuid')
  async passwordReset(@Param('uuid') uuid) {
    // redirect to webpage
  }

  @Post('password-reset/:uuid')
  async passwordResetPost(@Param('uuid') uuid) {
    // redirect to webpage
  }
}
