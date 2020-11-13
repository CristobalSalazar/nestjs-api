import { Inject, Injectable } from '@nestjs/common';
import { EmailClientToken } from './email.client';
import Mail from 'nodemailer/lib/mailer';
import { ConfigService } from '@nestjs/config';
import * as eta from 'eta';
import * as path from 'path';
import * as nodemailer from 'nodemailer';

interface SendTemplateOptions extends SendEmailOptions {
  subject: string;
  template: string;
  templateData: Object;
}

interface SendEmailOptions {
  recipients: string[];
}

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

  async sendPasswordResetEmail(options: SendEmailOptions & { link: string }) {
    const { recipients, link } = options;
    return await this.sendTemplate({
      subject: 'Password Reset',
      recipients,
      template: 'password-reset',
      templateData: { link },
    });
  }

  async sendVerificationEmail(options: SendEmailOptions & { link: string }) {
    const { recipients, link } = options;
    return this.sendTemplate({
      subject: 'Email Verification',
      recipients,
      template: 'password-reset',
      templateData: { link },
    });
  }

  private async sendTemplate(options: SendTemplateOptions) {
    const { recipients, subject, template, templateData } = options;
    const html = await eta.renderFile(template, templateData);
    return await this.sendEmail({
      recipients,
      subject,
      html,
    });
  }

  private async sendEmail(
    options: SendEmailOptions & { subject: string; html: string },
  ) {
    const result = await this.emailClient.sendMail({
      from: this.configService.get('EMAIL_SENDER', 'example@example.com'),
      subject: options.subject,
      to: options.recipients.join(','),
      html: options.html,
    });
    const isDevelopment =
      this.configService.get<string>('NODE_ENV') === 'development';
    return isDevelopment ? nodemailer.getTestMessageUrl(result) : { ok: 1 };
  }
}
