import { BadRequestException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserDocument } from '../users/user.schema';
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
    const passwordsMatch = await bcrypt.compare(password, user.password);
    if (passwordsMatch) {
      return user;
    }
    return null;
  }

  async login(user: UserDocument) {
    const { email, _id } = user;
    return {
      token: this.jwtService.sign({ _id, email }),
    };
  }

  async register(dto: RegisterDto) {
    const userExists = await this.usersService.findOne(dto.email);
    if (userExists) {
      throw new BadRequestException('User with email already exists');
    }
    const { password, _id } = await this.usersService.create(dto);
    return { _id };
  }
}
