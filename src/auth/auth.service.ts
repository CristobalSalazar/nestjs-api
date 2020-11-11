import {
  BadRequestException,
  Injectable,
  UseInterceptors,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserDocument } from '../users/entities/user.entity';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(
    email: string,
    password: string,
  ): Promise<UserDocument | null> {
    const user = await this.usersService.findOne(email);
    if (!user) {
      return null;
    }
    const passwordsMatch = await bcrypt.compare(password, user.password);
    if (passwordsMatch) {
      return user;
    }
    return null;
  }

  async login(user: UserDocument) {
    const { email, _id } = user;
    const access_token = this.jwtService.sign({ _id, email });
    const refreshToken = this.jwtService.sign({ _id, email });
    // update refreshToken
    await user.update({ refreshToken });
    return { access_token, refresh_token: refreshToken };
  }

  async register(dto: RegisterDto) {
    const userExists = await this.usersService.findOne(dto.email);
    if (userExists) {
      throw new BadRequestException('User with email already exists');
    }
    return await this.usersService.create(dto);
  }
}
