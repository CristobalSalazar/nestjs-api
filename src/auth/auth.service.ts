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
import { EmailVerificationService } from './email-verification.service';
import { PasswordResetDto } from './dto/password-reset.dto';
import { EmailService } from '../email/email.service';
import { ConfigService } from '@nestjs/config';

export type AuthTokenPayload = { _id: string };

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly emailVerificationService: EmailVerificationService,
    private readonly emailService: EmailService,
    private readonly configService: ConfigService,
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

  async requestPasswordReset({ email }: PasswordResetDto) {
    const uid = await this.usersService.getIdFromEmail(email);
    const { uuid } = await this.emailVerificationService.create(
      uid,
      'password_reset',
    );
    return await this.emailService.sendPasswordResetEmail({
      recipients: [email],
      link: `http://localhost:3000/password-reset/${uuid}`,
    });
  }

  async resetPassword(uuid: string, newPassword: string) {
    const emailVerification = await this.emailVerificationService.get(
      uuid,
      'password_reset',
    );
    const user = await this.usersService.findById(emailVerification.user);
    if (!user.emailVerified) {
      throw new UnauthorizedException(
        'Email is not verified. Please verify your email before attempting to reset your password',
      );
    }
    await Promise.all([
      this.usersService.updatePassword(user, newPassword),
      this.emailVerificationService.removeAllForUser(user._id),
    ]);
    return { ok: 1 };
  }

  async verifyEmail(uuid: string) {
    const emailVerification = await this.emailVerificationService.get(
      uuid,
      'email_confirmation',
    );
    const user = await this.usersService.setEmailAsVerified(
      emailVerification.user,
    );
    await emailVerification.remove();
    return { ok: 1 };
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
    try {
      await this.usersService.findByEmail(dto.email);
    } catch (notFoundException) {
      const user = await this.usersService.create(dto);
      const { uuid } = await this.emailVerificationService.create(
        user._id,
        'email_confirmation',
      );
      await this.emailService.sendVerificationEmail({
        recipients: [dto.email],
        link: `http://localhost:3000/verify-email/${uuid}`,
      });
      if (this.configService.get('NODE_ENV', 'development') === 'development') {
        return uuid;
      } else {
        return user;
      }
    }
    throw new BadRequestException('User with email already exists.');
  }

  getCookieSettings() {
    return this.configService.get<string>('NODE_ENV') === 'production'
      ? {
          httpOnly: true,
          secure: true,
          sameSite: true,
        }
      : {
          httpOnly: true,
        };
  }
}
