import { Injectable } from '@nestjs/common';
import { InjectModel, Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema, Types } from 'mongoose';

export type EmailVerificationDocument = EmailVerification & Document;

interface IModelFactory<T> {
  getSchema: () => MongooseSchema<any>;
  generate: () => T;
}

@Injectable()
class EmailVerificationFactory implements IModelFactory<EmailVerification> {
  constructor(
    @InjectModel(EmailVerification.name)
    private readonly emailVerificationModel,
  ) {}

  getSchema() {
    const schema = SchemaFactory.createForClass(EmailVerification);
    schema.index({ createdAt: 1 }, { expires: '1d' });
    return schema;
  }

  generate() {
    return new EmailVerification();
  }
}

@Schema({
  timestamps: true,
  collection: 'email_verifications',
})
export class EmailVerification {
  @Prop({ required: true })
  uuid: string;

  @Prop({ type: Types.ObjectId, required: true })
  user: string | Types.ObjectId;
}
