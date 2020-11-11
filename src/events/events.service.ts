import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { Event, EventDocument } from './entities/event.entity';

@Injectable()
export class EventsService {
  constructor(
    @InjectModel(Event.name) private eventModel: Model<EventDocument>,
  ) {}

  async create(createEventDto: CreateEventDto, uid: string) {
    const event = new Event();
    event.title = createEventDto.title;
    event.description = createEventDto.description;
    event.start = new Date(createEventDto.start);
    event.end = new Date(createEventDto.end);
    event.user = Types.ObjectId(uid);
    return await this.eventModel.create(event);
  }

  async findAll(uid: string) {
    const result = await this.eventModel.find({ user: Types.ObjectId(uid) });
    return result;
  }

  async findOne(id: string, uid: string) {
    return await this.eventModel.findOne({
      _id: Types.ObjectId(id),
      user: Types.ObjectId(uid),
    });
  }

  async update(id: string, uid: string, updateEventDto: UpdateEventDto) {
    const result = await this.eventModel.updateOne(
      {
        _id: Types.ObjectId(id),
        user: Types.ObjectId(uid),
      },
      updateEventDto,
    );
    return result;
  }

  async remove(id: string, uid: string) {
    const result = await this.eventModel.remove({
      _id: Types.ObjectId(id),
      user: Types.ObjectId(uid),
    });
    return result;
  }

  async removeAll(uid: string) {
    const result = await this.eventModel.remove({
      user: Types.ObjectId(uid),
    });
    return result;
  }
}
