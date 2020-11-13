import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  EmailVerification,
  EmailVerificationDocument,
  EmailVerificationType,
} from './entities/email-verification.entity';
import { Model } from 'mongoose';
import { UsersService } from '../users/users.service';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class EmailVerificationService {
  constructor(
    private readonly usersService: UsersService,
    @InjectModel(EmailVerification.name)
    private readonly emailVerificationModel: Model<EmailVerificationDocument>,
  ) {}

  async createEmailVerification(uid: string, type: EmailVerificationType) {
    return await this.emailVerificationModel.create({
      type,
      user: uid,
      uuid: uuidv4(),
    });
  }

  async existsForUser(uid: string, type: EmailVerificationType) {
    const verification = await this.emailVerificationModel.findOne({
      user: uid,
      type,
    });
    return !!verification;
  }

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
