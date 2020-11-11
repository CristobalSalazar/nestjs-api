import { Prop, raw, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true, trim: true })
  email: string;

  @Prop(raw({ type: String, required: true, hide: true }))
  password: string;

  @Prop({ default: false })
  emailVerified: boolean = false;

  @Prop()
  refreshToken: string;
}
