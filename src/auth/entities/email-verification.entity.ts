import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { User } from '../../users/entities/user.entity';

export type EmailVerificationDocument = EmailVerification & Document;
export type EmailVerificationType = 'email_confirmation' | 'password_reset';

@Schema({
  timestamps: true,
  collection: 'email_verifications',
})
export class EmailVerification {
  @Prop({
    required: true,
    enum: ['email_confirmation', 'password_reset'],
  })
  type: EmailVerificationType;

  @Prop({ required: true })
  uuid: string;

  @Prop({ type: Types.ObjectId, required: true, ref: User.name })
  user: string;
}

export const EmailVerificationSchema = SchemaFactory.createForClass(
  EmailVerification,
);
