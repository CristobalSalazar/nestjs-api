import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type PasswordResetDocument = PasswordReset & Document;

@Schema({ timestamps: true, collection: 'password_resets' })
export class PasswordReset {
  @Prop({ required: true })
  uuid: string;

  @Prop({ type: Types.ObjectId, required: true })
  user: string | Types.ObjectId;
}

const schema = SchemaFactory.createForClass(PasswordReset);
// attach hooks etc...
export const PasswordResetSchema = schema;
