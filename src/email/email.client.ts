import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

export const EmailClientToken = 'EMAIL_CLIENT';
export const EmailClientFactory = {
  provide: EmailClientToken,
  inject: [ConfigService],
  async useFactory(config: ConfigService) {
    const testAccount = await nodemailer.createTestAccount();
    return nodemailer.createTransport({
      host: config.get('EMAIL_HOST', 'smtp.ethereal.email'),
      port: config.get('EMAIL_PORT', 587),
      secure: false,
      auth: {
        user: config.get('EMAIL_USER', testAccount.user),
        pass: config.get('EMAIL_PASS', testAccount.pass),
      },
    });
  },
};
