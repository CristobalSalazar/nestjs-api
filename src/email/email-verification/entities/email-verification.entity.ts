import { Prop, Schema } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { User } from 'src/users/entities/user.entity';
export type EmailVerificationDocument = EmailVerification & Document;

@Schema({ timestamps: true })
export class EmailVerification {
  @Prop({ required: true, unique: true })
  uuid: string;

  @Prop({ type: Types.ObjectId, ref: User.name, required: true })
  user: string;
}
