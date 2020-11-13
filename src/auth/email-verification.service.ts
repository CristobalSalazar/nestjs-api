import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  EmailVerification,
  EmailVerificationDocument,
  EmailVerificationType,
} from './entities/email-verification.entity';
import { Model } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class EmailVerificationService {
  constructor(
    @InjectModel(EmailVerification.name)
    private readonly emailVerificationModel: Model<EmailVerificationDocument>,
  ) {}

  async removeAllForUser(uid: string) {
    return await this.emailVerificationModel.remove({ user: uid });
  }
  async get(uuid: string, type: EmailVerificationType) {
    const verification = await this.emailVerificationModel.findOne({
      uuid,
      type,
    });
    if (!verification) {
      throw new NotFoundException('Unable to find Email Verification');
    } else {
      return verification;
    }
  }

  async create(uid: string, type: EmailVerificationType) {
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
}
