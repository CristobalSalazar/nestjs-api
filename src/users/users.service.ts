import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { RegisterDto } from 'src/auth/dto/register.dto';
import { User, UserDocument } from './user.schema';
import * as bcryptjs from 'bcryptjs';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async findOne(email: string) {
    return await this.userModel.findOne({ email });
  }

  async create(dto: RegisterDto) {
    const user = new User();
    user.email = dto.email;
    const salt = await bcryptjs.genSalt(10);
    const hashedPassword = await bcryptjs.hash(dto.password, salt);
    user.password = hashedPassword;
    return await this.userModel.create(user);
  }
}
