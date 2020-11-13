import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { RegisterDto } from '../auth/dto/register.dto';
import { User, UserDocument } from './entities/user.entity';
import * as bcryptjs from 'bcryptjs';

@Injectable()
export class UsersService {
  private logger: Logger;
  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
  ) {
    this.logger = new Logger('users_service');
  }

  async getIdFromEmail(email: string): Promise<string> {
    const user = await this.findByEmail(email);
    return user._id;
  }
  async findByEmail(email: string) {
    const user = await this.userModel.findOne({ email });
    if (!user) {
      this.logger.log(`Could not find user with email ${email}`);
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

  async updatePassword(user: UserDocument, newPassword: string) {
    const salt = await bcryptjs.genSalt(10);
    user.password = await bcryptjs.hash(newPassword, salt);
    return await user.save();
  }
}
