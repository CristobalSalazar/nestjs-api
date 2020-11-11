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
import { EmailService } from 'src/email/email.service';

export type AuthToken = { _id: string };

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly emailService: EmailService,
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

  async verifyEmail(uuid: string) {
    const emailVerification = await this.emailService.findOneEmailVerificationByUuid(
      uuid,
    );
    if (!emailVerification) {
      throw new NotFoundException();
    }
    const user = await this.usersService.findOneById(emailVerification.user);
    if (!user) {
      await emailVerification.remove();
      throw new NotFoundException();
    } else {
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
    return await this.usersService.create(dto);
  }
}
