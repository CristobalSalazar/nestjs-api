import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
  Request,
  UseGuards,
} from '@nestjs/common';
import { EventsService } from './events.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { AuthGuard } from '@nestjs/passport';

@UseGuards(AuthGuard('jwt'))
@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Post()
  create(@Body() createEventDto: CreateEventDto, @Request() request) {
    return this.eventsService.create(createEventDto, request.user._id);
  }

  @Get()
  findAll(@Request() request) {
    return this.eventsService.findAll(request.user._id);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() requset) {
    return this.eventsService.findOne(id, requset.user._id);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() updateEventDto: UpdateEventDto,
    @Request() requset,
  ) {
    return this.eventsService.update(id, requset.user._id, updateEventDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Request() requset) {
    return this.eventsService.remove(id, requset.user._id);
  }
}
