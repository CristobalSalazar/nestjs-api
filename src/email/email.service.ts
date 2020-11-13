import { Inject, Injectable } from '@nestjs/common';
import { EmailClientToken } from './email.client';
import Mail from 'nodemailer/lib/mailer';
import { ConfigService } from '@nestjs/config';
import * as eta from 'eta';
import path from 'path';

@Injectable()
export class EmailService {
  constructor(
    @Inject(EmailClientToken) private readonly emailClient: Mail,
    private readonly configService: ConfigService,
  ) {
    eta.configure({
      views: path.join(__dirname, 'templates'),
    });
  }

  async sendPasswordResetEmail(recipient: string, link: string) {
    return this.sendEmailTemplate('password-reset', { link }, [recipient]);
  }

  async sendVerificationEmail(recipient: string, link: string) {
    return this.sendEmailTemplate('email-verification', { link }, [recipient]);
  }

  private async sendEmailTemplate(
    template: string,
    data: any,
    recipients: string[],
  ) {
    const contents = await eta.renderFile(template, data);
    return await this.sendEmail(recipients, contents);
  }

  private async sendEmail(recipients: string[], html: string) {
    return await this.emailClient.sendMail({
      from: this.configService.get('EMAIL_SENDER', 'example@example.com'),
      to: recipients.join(','),
      html,
    });
  }
}
