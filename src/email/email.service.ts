import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import {
  EmailVerification,
  EmailVerificationDocument,
} from './email-verification/entities/email-verification.entity';

@Injectable()
export class EmailService {
  constructor(
    @InjectModel(EmailVerification.name)
    private readonly emailVerificationModel: Model<EmailVerificationDocument>,
  ) {}

  async findOneEmailVerificationByUuid(uuid: string) {
    return await this.emailVerificationModel.findOne({ uuid });
  }

  async sendAccountVerificationLink(uid: string) {
    const uuid = uuidv4();
    await this.emailVerificationModel.create({
      uuid,
      user: uid,
    });
  }
}
