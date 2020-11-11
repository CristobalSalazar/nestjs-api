import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { RegisterDto } from '../auth/dto/register.dto';
import { User, UserDocument } from './entities/user.entity';
import * as bcryptjs from 'bcryptjs';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async findOne(email: string) {
    return await this.userModel.findOne({ email });
  }

  async deleteOne(id: string) {
    const user = await this.userModel.findOne({ _id: Types.ObjectId(id) });
    return await user.remove();
  }

  async create(dto: RegisterDto) {
    const salt = await bcryptjs.genSalt(10);
    const user = new User();
    user.email = dto.email;
    user.password = await bcryptjs.hash(dto.password, salt);
    user.name = dto.name;
    return await this.userModel.create(user);
  }
}
