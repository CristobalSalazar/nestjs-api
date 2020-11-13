import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

export const EmailClientToken = 'EMAIL_CLIENT';
export const EmailClientFactory = {
  provide: EmailClientToken,
  inject: [ConfigService],
  async useFactory(configService: ConfigService) {
    const testAccount = await nodemailer.createTestAccount();
    return nodemailer.createTransport({
      host: configService.get('EMAIL_HOST', 'smtp.ethereal.email'),
      port: configService.get('EMAIL_PORT', 587),
      secure: false,
      auth: {
        user: configService.get('EMAIL_USER', testAccount.user),
        pass: configService.get('EMAIL_PASS', testAccount.pass),
      },
    });
  },
};
