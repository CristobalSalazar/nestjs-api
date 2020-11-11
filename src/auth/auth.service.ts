import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserDocument } from '../users/entities/user.entity';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import * as bcrypt from 'bcryptjs';
import { InjectModel } from '@nestjs/mongoose';
import {
  EmailVerification,
  EmailVerificationDocument,
} from './entities/email-verification.entity';
import { Model, Types } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

export type AuthToken = { _id: string };

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    @InjectModel(EmailVerification.name)
    private readonly emailVerificationModel: Model<EmailVerificationDocument>,
  ) {}

  async validateUser(
    email: string,
    password: string,
  ): Promise<UserDocument | null> {
    const user = await this.usersService.findOneByEmail(email);
    if (!user) return null;
    const passwordsMatch = await bcrypt.compare(password, user.password);
    if (passwordsMatch) return user;
    return null;
  }

  async createEmailVerificationDocument(uid: string) {
    return await this.emailVerificationModel.create({
      user: Types.ObjectId(uid),
      uuid: uuidv4(),
    });
  }

  async verifyEmail(uuid: string) {
    const emailVerification = await this.emailVerificationModel.findOne({
      uuid,
    });
    if (!emailVerification) {
      throw new NotFoundException();
    }
    const user = await this.usersService.findOneById(
      emailVerification.user.toString(),
    );

    if (!user) {
      await emailVerification.remove();
      throw new NotFoundException();
    } else {
      await emailVerification.remove();
      return await user.update({ emailVerified: true });
    }
  }

  async refreshTokens(tokenPayload: AuthToken, refreshToken: string) {
    const { _id } = tokenPayload;
    const user = await this.usersService.findOneById(_id);
    if (!user) throw new NotFoundException();
    if (user.refreshToken !== refreshToken) throw new UnauthorizedException();
    const access_token = this.jwtService.sign({ _id });
    const refresh_token = this.jwtService.sign({ _id });
    await user.update({ refreshToken: refresh_token });
    return { access_token, refresh_token };
  }

  async login(user: UserDocument) {
    const { _id } = user;
    const access_token = this.jwtService.sign({ _id });
    const refresh_token = this.jwtService.sign({ _id });
    await user.update({ refreshToken: refresh_token });
    return { access_token, refresh_token };
  }

  async register(dto: RegisterDto) {
    const userExists = await this.usersService.findOneByEmail(dto.email);
    if (userExists) {
      throw new BadRequestException('User with email already exists');
    }
    const user = await this.usersService.create(dto);
    await this.createEmailVerificationDocument(user._id);
    return user;
  }
}
