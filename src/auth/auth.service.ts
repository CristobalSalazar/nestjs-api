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
  EmailVerificationType,
} from './entities/email-verification.entity';
import { Model } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import { EmailVerificationService } from './email-verification.service';

export type AuthTokenPayload = { _id: string };

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly emailVerificationService: EmailVerificationService,
    @InjectModel(EmailVerification.name)
    private readonly emailVerificationModel: Model<EmailVerificationDocument>,
  ) {}

  async validateUser(
    email: string,
    password: string,
  ): Promise<UserDocument | null> {
    const user = await this.usersService.findByEmail(email);
    if (!user) return null;
    const passwordsMatch = await bcrypt.compare(password, user.password);
    if (passwordsMatch) return user;
    return null;
  }

  async createEmailVerification(uid: string, type: EmailVerificationType) {
    return await this.emailVerificationModel.create({
      type,
      user: uid,
      uuid: uuidv4(),
    });
  }

  async passwordReset(uuid: string, newPassword: string) {
    const emailVerification = await this.emailVerificationService.getEmailVerification(
      uuid,
      'password_reset',
    );
    return await this.usersService.updatePassword(
      emailVerification.user,
      newPassword,
    );
  }

  async verifyEmail(uuid: string) {
    const emailVerification = await this.emailVerificationService.getEmailVerification(
      uuid,
      'email_confirmation',
    );
    return this.usersService.setEmailAsVerified(emailVerification.user);
  }

  async refreshTokens(
    authTokenPayload: AuthTokenPayload,
    refreshToken: string,
  ) {
    const { _id } = authTokenPayload;
    const user = await this.usersService.findById(_id);
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
    const userExists = await this.usersService.findByEmail(dto.email);
    if (userExists) {
      throw new BadRequestException('User with email already exists');
    }
    const user = await this.usersService.create(dto);
    await this.createEmailVerification(user._id, 'email_confirmation');
    return user;
  }
}
