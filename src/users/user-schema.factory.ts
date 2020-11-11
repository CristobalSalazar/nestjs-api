import { Logger } from '@nestjs/common';
import { AsyncModelFactory, SchemaFactory } from '@nestjs/mongoose';
import { EventsModule } from '../events/events.module';
import { EventsService } from '../events/events.service';
import { User } from './entities/user.entity';

const UserSchema = SchemaFactory.createForClass(User);

export const UserSchemaFactory: AsyncModelFactory = {
  name: User.name,
  imports: [EventsModule],
  inject: [EventsService],
  useFactory(eventService: EventsService) {
    const logger = new Logger('UserSchema');
    UserSchema.pre('remove', async function (next) {
      logger.log(`Removing user ${this._id}`);
      await eventService.removeAll(this._id);
      logger.log(`Removed events for user ${this._id}`);
      next();
    });
    return UserSchema;
  },
};
