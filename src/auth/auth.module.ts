import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { UsersModule } from '../users/users.module';
import { AuthService } from './auth.service';
import { LocalStrategy } from './local.strategy';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './jwt.strategy';
import { ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import {
  EmailVerification,
  EmailVerificationSchema,
} from './entities/email-verification.entity';
import { EmailVerificationService } from './email-verification.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: EmailVerification.name,
        schema: EmailVerificationSchema,
      },
    ]),
    UsersModule,
    PassportModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory(config: ConfigService) {
        return {
          secret: config.get('APP_KEY'),
          signOptions: {
            expiresIn: '3h',
          },
        };
      },
    }),
  ],
  providers: [
    AuthService,
    LocalStrategy,
    JwtStrategy,
    EmailVerificationService,
  ],
  controllers: [AuthController],
})
export class AuthModule {}
