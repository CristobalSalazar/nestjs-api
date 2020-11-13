import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types, Document } from 'mongoose';
import { User } from '../../users/entities/user.entity';

export type ProfileDocument = Profile & Document;

@Schema({ timestamps: true })
export class Profile {
  @Prop()
  bio: string;

  @Prop({ type: Types.ObjectId, ref: User.name, required: true, hide: true })
  user: User | Types.ObjectId;
}

export const ProfileSchema = SchemaFactory.createForClass(Profile);
