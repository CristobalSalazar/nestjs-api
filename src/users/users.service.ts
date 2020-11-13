import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { RegisterDto } from '../auth/dto/register.dto';
import { User, UserDocument } from './entities/user.entity';
import * as bcryptjs from 'bcryptjs';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
  ) {}

  async findByEmail(email: string) {
    const user = await this.userModel.findOne({ email });
    if (!user) {
      throw new NotFoundException();
    } else {
      return user;
    }
  }

  async findById(id: string) {
    return this.userModel.findById(id);
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

  async setEmailAsVerified(id: string) {
    return this.userModel.findByIdAndUpdate(id, { emailVerified: true });
  }

  async updatePassword(id: string, newPassword: string) {
    const salt = await bcryptjs.genSalt(10);
    const user = await this.userModel.findById(id);
    if (!user) throw new NotFoundException();
    user.password = await bcryptjs.hash(newPassword, salt);
    return await user.save();
  }
}
