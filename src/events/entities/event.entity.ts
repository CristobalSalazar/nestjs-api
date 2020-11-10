import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types, Document } from 'mongoose';
import { User } from 'src/users/user.schema';

export type EventDocument = Event & Document;
@Schema({ timestamps: true })
export class Event {
  @Prop({ required: true })
  title: string;

  @Prop()
  description: string;

  @Prop({ required: true })
  start: Date;

  @Prop({ required: true })
  end: Date;

  @Prop({ type: Types.ObjectId, ref: User.name, required: true, hide: true })
  user: User | Types.ObjectId;
}

export const EventSchema = SchemaFactory.createForClass(Event);
