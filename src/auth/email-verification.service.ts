import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  EmailVerification,
  EmailVerificationDocument,
  EmailVerificationType,
} from './entities/email-verification.entity';
import { Model } from 'mongoose';
import { UsersService } from '../users/users.service';

@Injectable()
export class EmailVerificationService {
  constructor(
    private readonly usersService: UsersService,
    @InjectModel(EmailVerification.name)
    private readonly emailVerificationModel: Model<EmailVerificationDocument>,
  ) {}

  async getEmailVerification(uuid: string, type: EmailVerificationType) {
    const emailVerification = await this.emailVerificationModel.findOne({
      uuid,
      type,
    });
    if (!emailVerification) {
      throw new NotFoundException();
    } else {
      return emailVerification;
    }
  }
}
